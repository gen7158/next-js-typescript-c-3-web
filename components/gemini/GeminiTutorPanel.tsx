"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Check, Copy, GraduationCap, Loader2, Send, Sparkles, Trash2, WandSparkles, X } from "lucide-react";
import { askGeminiTutor } from "@/lib/gemini";
import type { GeminiMode } from "@/types/gemini";
import { useLearningStore } from "@/store/learningStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { MarkdownAnswer } from "@/components/gemini/MarkdownAnswer";

const modes: { id: GeminiMode; label: string }[] = [
  { id: "simple", label: "超やさしく" },
  { id: "detailed", label: "詳しく" },
  { id: "exam", label: "3級対策" },
  { id: "debug", label: "エラー診断" },
  { id: "socratic", label: "一緒に考える" },
  { id: "review", label: "レビュー" },
];

const starterPrompts: Record<GeminiMode, string[]> = {
  simple: ["小学生にも伝わる言葉で説明して", "身近なたとえで説明して", "今覚えることを3つに絞って"],
  detailed: ["このコードを1行ずつ説明して", "値の変化を表にして", "初心者が間違えやすい所も教えて"],
  exam: ["3級での出題パターンを教えて", "実行結果予測の手順を教えて", "似た4択問題を1問作って"],
  debug: ["このエラーの原因を順に切り分けて", "最小の修正だけ教えて", "再発しない確認方法を教えて"],
  socratic: ["答えを言わず最初の質問をして", "ヒントを1つずつ出して", "私の考え方のどこまで合っているか確認して"],
  review: ["このコードを安全性も含めてレビューして", "良い点と優先修正を分けて", "境界値のテストを提案して"],
};

export function GeminiTutorPanel({ compact = false, onClose, initialPrompt }: { compact?: boolean; onClose?: () => void; initialPrompt?: string }) {
  const apiKey = useLearningStore((state) => state.apiKey);
  const selectedModel = useLearningStore((state) => state.selectedModel);
  const mode = useUIStore((state) => state.aiMode);
  const setMode = useUIStore((state) => state.setAiMode);
  const aiContext = useUIStore((state) => state.aiContext);
  const messages = useUIStore((state) => state.chatMessages);
  const addMessage = useUIStore((state) => state.addChatMessage);
  const clearChat = useUIStore((state) => state.clearChat);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const submit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const context = [
        aiContext.lesson && `レッスン:\n${aiContext.lesson}`,
        aiContext.problem && `問題:\n${aiContext.problem}`,
        aiContext.code && `現在のコード:\n${aiContext.code}`,
        aiContext.error && `エラー・実行結果:\n${aiContext.error}`,
      ].filter(Boolean).join("\n\n");
      addMessage({ id: crypto.randomUUID(), role: "user", text: prompt });
      const response = await askGeminiTutor({
        apiKey,
        model: selectedModel,
        mode,
        prompt,
        context,
        history: messages.slice(-8).map((message) => ({ role: message.role, text: message.text })),
      });
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: response.text });
      setPrompt("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "AIへの接続に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn("flex h-full flex-col", compact ? "p-5" : "min-h-[620px] rounded-xl border border-border bg-surface p-5")}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-[#ada4ff]"><Bot className="h-5 w-5" /></span>
        <div>
          <h2 className="text-sm font-semibold">Gemini チューター</h2>
          <p className="text-[10px] text-muted">{apiKey ? selectedModel : "APIキー未設定"}</p>
        </div>
        <span className={cn("ml-auto h-2 w-2 rounded-full", apiKey ? "bg-success shadow-[0_0_8px_#43c59e]" : "bg-muted")} />
        {messages.length > 0 && <Button variant="ghost" size="icon" onClick={clearChat} aria-label="履歴を消去"><Trash2 className="h-4 w-4" /></Button>}
        {onClose && <Button variant="ghost" size="icon" onClick={onClose} aria-label="AIパネルを閉じる"><X className="h-4 w-4" /></Button>}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-background p-1 sm:grid-cols-3">
        {modes.map((item) => (
          <button key={item.id} onClick={() => setMode(item.id)} className={cn("rounded-md px-1 py-2 text-[10px] font-semibold text-muted transition", mode === item.id && "bg-panel text-white")}>{item.label}</button>
        ))}
      </div>

      <div className="mb-3 flex-1 overflow-y-auto rounded-xl border border-border bg-background/70 p-4">
        {!apiKey ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
            <Sparkles className="mb-3 h-7 w-7 text-primary" />
            <p className="text-xs font-semibold">AI学習を有効にしましょう</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">Gemini APIキーを保存すると、問題やコードについて質問できます。</p>
            <Link href="/settings" className="mt-4 rounded-lg bg-primary px-3 py-2 text-xs font-semibold">設定を開く</Link>
          </div>
        ) : messages.length ? (
          <div className="space-y-5">
            {messages.map((message) => (
              <div key={message.id} className={cn("rounded-xl p-4", message.role === "user" ? "ml-8 bg-primary/15 text-sm" : "border border-border bg-panel/60")}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted">{message.role === "user" ? "あなた" : "Gemini"}</p>
                {message.role === "assistant" ? <MarkdownAnswer text={message.text} /> : <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>}
                {message.role === "assistant" && <div className="mt-3 flex flex-wrap gap-3">
                  <button onClick={async () => { await navigator.clipboard.writeText(message.text); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-white">{copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}回答をコピー</button>
                  <button onClick={() => { setMode("simple"); setPrompt("今の説明をもっと短く、身近なたとえを使って説明し直してください。"); }} className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-white"><WandSparkles className="h-3 w-3" />もっとやさしく</button>
                  <button onClick={() => { setMode("socratic"); setPrompt("今の内容が理解できたか確認する問題を、答えを伏せて1問出してください。"); }} className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-white"><GraduationCap className="h-3 w-3" />確認問題</button>
                </div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold">何でも質問してください</p>
            {starterPrompts[mode].map((text) => (
              <button key={text} onClick={() => setPrompt(text)} className="block w-full rounded-lg border border-border bg-panel/60 p-3 text-left text-[11px] text-muted transition hover:border-primary/40 hover:text-white">{text}</button>
            ))}
          </div>
        )}
        {error && <p className="mt-3 rounded-lg bg-danger/10 p-3 text-[11px] leading-relaxed text-danger">{error}</p>}
      </div>

      <div>
        <div className="relative">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); } }} disabled={!apiKey || loading} placeholder={aiContext.title ? `${aiContext.title}について質問...` : "C言語について質問..."} className="min-h-24 w-full resize-none rounded-xl border border-border bg-panel px-4 py-3 pr-12 text-sm leading-6 outline-none placeholder:text-muted/60 focus:border-primary" />
          <Button size="icon" onClick={() => void submit()} disabled={!apiKey || !prompt.trim() || loading} className="absolute bottom-3 right-3 h-8 w-8">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-right text-[9px] text-muted">Enterで改行 · ⌘ / Ctrl + Enterで送信</p>
      </div>
    </section>
  );
}
