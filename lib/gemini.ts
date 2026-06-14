import type { GeminiModel, GeminiMode, GeminiRequest, GeminiResponse } from "@/types/gemini";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const API_KEY_STORAGE = "c-pass-lab-gemini-key";
const MODEL_STORAGE = "c-pass-lab-gemini-model";

export class GeminiError extends Error {
  constructor(message: string, public code: "NO_KEY" | "AUTH" | "RATE_LIMIT" | "NETWORK" | "MODEL" | "EMPTY" | "UNKNOWN") {
    super(message);
  }
}

export function saveApiKey(apiKey: string) {
  if (typeof window !== "undefined") localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
}

export function getApiKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}

export function deleteApiKey() {
  if (typeof window !== "undefined") localStorage.removeItem(API_KEY_STORAGE);
}

export function saveSelectedModel(modelName: string) {
  if (typeof window !== "undefined") localStorage.setItem(MODEL_STORAGE, modelName.replace(/^models\//, ""));
}

export function getSelectedModel() {
  if (typeof window === "undefined") return "gemini-2.5-flash";
  return localStorage.getItem(MODEL_STORAGE) ?? "gemini-2.5-flash";
}

function parseHttpError(status: number, details?: string): GeminiError {
  if (status === 400 || status === 401 || status === 403) {
    return new GeminiError("APIキーが正しいか、Gemini APIが有効か確認してください。", "AUTH");
  }
  if (status === 404) return new GeminiError("選択したモデルを利用できません。モデル一覧を更新してください。", "MODEL");
  if (status === 429) return new GeminiError("利用回数の上限に達しました。少し時間を置いて再試行してください。", "RATE_LIMIT");
  return new GeminiError(details || "Gemini APIでエラーが発生しました。", "UNKNOWN");
}

export async function listGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  if (!apiKey.trim()) throw new GeminiError("Gemini APIキーが未設定です。", "NO_KEY");
  try {
    const response = await fetch(`${API_BASE}/models?key=${encodeURIComponent(apiKey.trim())}`);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      throw parseHttpError(response.status, body?.error?.message);
    }
    const data = await response.json() as { models?: GeminiModel[] };
    return (data.models ?? [])
      .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model) => ({ ...model, name: model.name.replace(/^models\//, "") }));
  } catch (error) {
    if (error instanceof GeminiError) throw error;
    throw new GeminiError("モデル一覧を取得できませんでした。通信環境を確認してください。", "NETWORK");
  }
}

export function selectRecommendedModel(models: GeminiModel[]) {
  const score = (model: GeminiModel) => {
    const name = model.name.toLowerCase();
    const version = name.match(/gemini-(\d+)(?:\.(\d+))?/)?.slice(1).map(Number) ?? [0, 0];
    let value = (version[0] ?? 0) * 100 + (version[1] ?? 0) * 10;
    if (name.includes("flash")) value += 40;
    if (name.includes("pro")) value += 20;
    if (name.includes("latest")) value += 8;
    if (name.includes("preview") || name.includes("experimental") || name.includes("-exp")) value -= 12;
    if (name.includes("lite")) value -= 4;
    return value;
  };
  return [...models].sort((a, b) => score(b) - score(a))[0]?.name ?? "gemini-2.5-flash";
}

function modeInstruction(mode: GeminiMode) {
  if (mode === "simple") return "100〜200字程度で、難しい用語を避けてください。最初に一言の結論、次に身近なたとえ、最後に今やる1ステップを示してください。";
  if (mode === "exam") return "C言語プログラミング能力認定試験3級での問われ方、覚える点、似た問題の注意点、実行結果を追う表を整理してください。";
  if (mode === "debug") return "エラーを推測だけで断定せず、症状、最有力原因、確認方法、最小の修正、再確認の順に説明してください。";
  if (mode === "socratic") return "答えをすぐに言わず、初心者が自分で気づける短い質問を1つずつ出してください。次の一歩を具体化してください。";
  if (mode === "review") return "コードを正しさ、読みやすさ、安全性、境界値、3級範囲との関係でレビューし、良い点、優先して直す点、改善例を示してください。";
  return "なぜそうなるかを丁寧に説明し、コードがあれば1行ずつ解説し、初心者がつまずく点と確認問題も示してください。";
}

async function generate(apiKey: string, request: GeminiRequest): Promise<GeminiResponse> {
  if (!apiKey.trim()) throw new GeminiError("AI機能を使うには設定画面でAPIキーを保存してください。", "NO_KEY");
  const model = (request.model || getSelectedModel()).replace(/^models\//, "");
  const prompt = [
    "あなたは、C言語を初めて学ぶ人を3級合格まで導き、その後は安全なCプログラムを作れる段階まで伴走する講師です。",
    "現在の文脈が3級編なら試験範囲を優先し、発展編なら3級の知識とのつながりを示してください。答えだけでなく理由を説明し、未定義動作や危険なコードは明確に注意してください。",
    "回答は正しいMarkdownで書いてください。見出しは##または###、箇条書きは-、C言語の用語は`インラインコード`、複数行コードは```cのコードフェンスを使ってください。HTMLは使わず、Markdown記号を閉じ忘れないでください。",
    modeInstruction(request.mode),
    request.history?.length ? `直前の会話:\n${request.history.slice(-8).map((message) => `${message.role === "user" ? "学習者" : "講師"}: ${message.text}`).join("\n")}` : "",
    request.context ? `学習中の文脈:\n${request.context}` : "",
    `質問:\n${request.prompt}`,
  ].filter(Boolean).join("\n\n");

  try {
    const response = await fetch(`${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      throw parseHttpError(response.status, body?.error?.message);
    }
    const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) throw new GeminiError("Geminiから説明文が返りませんでした。質問を変えて再試行してください。", "EMPTY");
    return { text, model };
  } catch (error) {
    if (error instanceof GeminiError) throw error;
    throw new GeminiError("Geminiへ接続できませんでした。通信環境を確認してください。", "NETWORK");
  }
}

export function generateGeminiExplanation(params: GeminiRequest & { apiKey: string }) {
  return generate(params.apiKey, params);
}

export function askGeminiTutor(params: GeminiRequest & { apiKey: string }) {
  return generate(params.apiKey, params);
}

export function analyzeWeakness(params: { apiKey: string; model?: string; categories: { category: string; accuracy: number }[] }) {
  const summary = params.categories.map((item) => `${item.category}: 正答率${item.accuracy}%`).join("\n");
  return generate(params.apiKey, {
    mode: "exam",
    model: params.model,
    prompt: `次の学習結果から、弱点の原因と次の3ステップを提案してください。\n${summary || "まだ回答履歴がありません。"}`,
  });
}
