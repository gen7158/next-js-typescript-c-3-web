import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt, mode, context, history, apiKey: browserApiKey, model: selectedModel } = await request.json() as {
      prompt?: string;
      mode?: 'beginner' | 'step' | 'debug' | 'review' | 'design';
      context?: string;
      history?: { role: 'user' | 'assistant'; text: string }[];
      apiKey?: string;
      model?: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: '質問を入力してください。' }, { status: 400 });
    }

    const apiKey = browserApiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const demo = [
        '## デモ解説',
        '',
        'Geminiを利用するには、設定画面からAPIキーをブラウザへ保存してください。',
        '',
        `**質問:** ${prompt}`,
        '',
        '### 確認する順番',
        mode === 'debug'
          ? '- どの行で起きたか\n- 期待と何が違うか\n- どこまで正常か'
          : '- 入力される値\n- 実行される処理\n- 最後の結果',
        '',
        context ? '> 現在のレッスンやコードはAIへ渡せる状態です。' : '',
      ].join('\n');
      return NextResponse.json({ success: true, text: demo, isMock: true });
    }

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: selectedModel?.trim() || process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    });
    const modeInstruction = mode === 'step'
      ? '答えを最初から出さず、現在地を確認してからヒントを一段階ずつ出してください。最後に理解確認の質問を1つ付けてください。'
      : mode === 'debug'
        ? '症状、再現条件、原因候補、確認方法、最小の修正案の順でデバッグしてください。断定できない場合は確認手順を示してください。'
        : mode === 'review'
          ? '良い点、直すべき点、危険度、修正理由、次に試す小さな変更の順でコードレビューしてください。完成コードの丸ごと提示は避けてください。'
        : mode === 'design'
          ? '要件、画面、API、DB、認証・認可、失敗時、テストの順で設計を整理し、初心者にも分かる理由を付けてください。'
          : '最初に一言の結論、次に身近なたとえ、最後に短いコード例の順で、専門用語には直後に簡単な意味を付けてください。';

    const conversation = Array.isArray(history)
      ? history.slice(-8).map((message) => `${message.role === 'user' ? '学習者' : 'チューター'}: ${message.text}`).join('\n')
      : '';

    const result = await model.generateContent([
      'あなたはTypeScript、React、Next.js、Node.js、REST API、SQL、Prisma、認証、テスト、デプロイを教えるフルスタック学習チューターです。',
      '初心者向けの言葉を使い、処理がブラウザ、Next.jsサーバー、データベースのどこで動くかを明確にしてください。',
      '外部入力を扱う場合は、型だけで安全と判断せず、実行時検証、認証、認可、秘密情報の管理も確認してください。',
      '学習者を責める表現を避け、「何が分かっていて、次に何を一つ確認すればよいか」を明確にしてください。',
      '回答は正しいMarkdownで書いてください。見出しは##または###、箇条書きは-、用語は`インラインコード`、複数行コードは言語名付きコードフェンスを使ってください。HTMLは使わず、Markdown記号を閉じ忘れないでください。',
      '短い段落と箇条書きを使い、最後に「次の一歩」を1つだけ示してください。',
      modeInstruction,
      conversation ? `直前の会話:\n${conversation}` : '',
      context ? `現在の学習文脈:\n${context}` : '',
      `質問:\n${prompt}`,
    ].filter(Boolean).join('\n\n'));

    return NextResponse.json({ success: true, text: result.response.text(), isMock: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI解説を生成できませんでした。';
    const lower = message.toLowerCase();
    const friendly = lower.includes('api key') || lower.includes('permission')
      ? 'APIキーが正しいか、Gemini APIが有効か確認してください。'
      : lower.includes('quota') || lower.includes('429') || lower.includes('rate')
        ? '利用上限に達した可能性があります。少し待つか、別の利用可能モデルを選んでください。'
        : lower.includes('model') || lower.includes('not found')
          ? '選択モデルを利用できません。設定画面でモデル一覧を更新し、別のモデルを選んでください。'
          : 'AIとの通信に失敗しました。通信状態を確認して、もう一度試してください。';
    return NextResponse.json({ success: false, error: `${friendly}\n詳細: ${message}` }, { status: 500 });
  }
}
