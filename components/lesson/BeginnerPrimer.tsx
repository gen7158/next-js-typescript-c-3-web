import { BookOpenCheck, Footprints, Lightbulb, ShieldQuestion } from "lucide-react";
import type { Lesson } from "@/types/lesson";

function analogyFor(lesson: Lesson) {
  const title = lesson.title.toLowerCase();
  if (title.includes("ポインタ") || title.includes("メモリ")) return "住所を書いたメモを使って、目的の引き出しを開けるイメージです。";
  if (title.includes("配列") || title.includes("リスト")) return "番号の付いたロッカーへ、同じ種類のデータを順番に入れるイメージです。";
  if (title.includes("関数")) return "材料を渡すと決められた作業をして結果を返す、小さな担当者のようなものです。";
  if (title.includes("if") || title.includes("switch") || title.includes("分岐")) return "信号や分かれ道のように、条件によって進む処理を選びます。";
  if (title.includes("for") || title.includes("while") || title.includes("繰り返")) return "同じ作業を回数や条件が満たされるまで繰り返すチェックリストです。";
  if (title.includes("ファイル")) return "机の上のメモリだけでなく、次回も読めるノートへ記録する作業です。";
  if (title.includes("構造体")) return "学生証のように、名前・番号・状態を1枚へまとめるイメージです。";
  return "コンピューターへ渡す手順書を、短い部品に分けて理解するイメージです。";
}

export function BeginnerPrimer({ lesson }: { lesson: Lesson }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan/20 bg-gradient-to-br from-cyan/10 via-surface to-surface">
      <div className="border-b border-cyan/15 p-6 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan">Start gently</p>
        <h2 className="mt-2 text-xl font-semibold">まず30秒でつかみましょう</h2>
        <p className="mt-3 text-sm leading-8 text-[#cbd0da]">{lesson.summary} 最初は構文を全部暗記せず、「何のために使うか」を一言で説明できれば十分です。</p>
      </div>
      <div className="grid gap-px bg-cyan/15 md:grid-cols-3">
        <div className="bg-surface/95 p-5"><Lightbulb className="h-5 w-5 text-warning" /><h3 className="mt-3 text-sm font-semibold">身近なたとえ</h3><p className="mt-2 text-xs leading-6 text-muted">{analogyFor(lesson)}</p></div>
        <div className="bg-surface/95 p-5"><Footprints className="h-5 w-5 text-success" /><h3 className="mt-3 text-sm font-semibold">今日の3ステップ</h3><ol className="mt-2 space-y-1 text-xs leading-6 text-muted"><li>1. 基本例をそのまま読む</li><li>2. 値が変わる行へ印を付ける</li><li>3. コードを1か所だけ変える</li></ol></div>
        <div className="bg-surface/95 p-5"><ShieldQuestion className="h-5 w-5 text-[#aaa1ff]" /><h3 className="mt-3 text-sm font-semibold">今は覚えなくてOK</h3><p className="mt-2 text-xs leading-6 text-muted">細かな書式や例外は、コード例を見ながらで大丈夫です。まず処理の順番を追えることを優先します。</p></div>
      </div>
      <div className="flex items-center gap-2 border-t border-cyan/15 px-6 py-3 text-[10px] text-muted"><BookOpenCheck className="h-3.5 w-3.5 text-cyan" />分からない言葉はAIの「超やさしく」で、その場で言い換えられます。</div>
    </section>
  );
}
