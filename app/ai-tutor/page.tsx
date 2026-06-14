import { Bot, Code2, GraduationCap, MessageCircleQuestion, Sparkles } from "lucide-react";
import { GeminiTutorPanel } from "@/components/gemini/GeminiTutorPanel";
import { Card } from "@/components/ui/card";

const capabilities = [
  { icon: MessageCircleQuestion, title: "わからない理由を質問", text: "答えだけでなく、考え方を初心者向けに説明します。" },
  { icon: Code2, title: "コードを1行ずつ解説", text: "貼り付けたCコードの値の変化と処理順を追います。" },
  { icon: GraduationCap, title: "3級の出題に絞る", text: "試験で問われやすい点と、似た問題の注意点を整理します。" },
];

export default function AiTutorPage() {
  return (
    <div className="animate-in">
      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/20 via-surface to-cyan/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-[#b0a8ff]"><Bot className="h-6 w-6" /><span className="text-xs font-bold uppercase tracking-[.18em]">AI study partner</span></div>
        <h1 className="mt-4 text-3xl font-bold">「なぜ？」をその場で解決。</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">質問の詳しさを3モードから選べます。C言語3級の範囲に絞り、難しい言葉を避けて説明します。</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-[.65fr_1.35fr]">
        <div className="space-y-3">
          {capabilities.map((item) => <Card key={item.title} className="p-5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-[#aba2ff]"><item.icon className="h-4 w-4" /></span><h2 className="mt-4 text-sm font-semibold">{item.title}</h2><p className="mt-2 text-xs leading-6 text-muted">{item.text}</p></Card>)}
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-[11px] leading-6 text-warning"><Sparkles className="mb-2 h-4 w-4" />AIの回答は必ず正しいとは限りません。教材の説明や実際の実行結果と合わせて確認しましょう。</div>
        </div>
        <GeminiTutorPanel />
      </div>
    </div>
  );
}
