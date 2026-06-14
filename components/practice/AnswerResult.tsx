import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import type { Question } from "@/types/question";
import { GeminiExplanationButton } from "@/components/gemini/GeminiExplanationButton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnswerResult({ question, correct }: { question: Question; correct: boolean }) {
  return (
    <Card className={cn("mt-4 border-l-4 p-5", correct ? "border-l-success" : "border-l-danger")}>
      <div className={cn("flex items-center gap-2 font-semibold", correct ? "text-success" : "text-danger")}>{correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{correct ? "正解です！" : "不正解です"}</div>
      <div className="mt-4 rounded-lg bg-panel/70 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold"><Lightbulb className="h-4 w-4 text-warning" />なぜこの答えになる？</p>
        <p className="mt-2 text-xs leading-6 text-[#cdd2dd]">{question.explanation}</p>
      </div>
      {question.choices && <div className="mt-3 rounded-lg border border-border bg-background/50 p-4"><p className="text-xs font-semibold">選択肢の確認</p><div className="mt-3 space-y-2">{question.choices.map((choice, index) => <div key={`${choice}-${index}`} className="flex gap-3 text-xs leading-6"><span className={index === question.answer ? "font-bold text-success" : "text-muted"}>{String.fromCharCode(65 + index)}</span><p className="text-[#cdd2dd]"><strong className={index === question.answer ? "text-success" : "text-white"}>{choice}</strong>：{question.choiceExplanations?.[index] ?? (index === question.answer ? `この選択肢が正解です。${question.explanation}` : "問題の条件またはC言語の構文と一致しないため、この選択肢は正解になりません。")}</p></div>)}</div></div>}
      {question.examTip && <div className="mt-3 rounded-lg border border-cyan/15 bg-cyan/5 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-cyan">試験ポイント</p><p className="mt-2 text-xs leading-6 text-[#cdd2dd]">{question.examTip}</p></div>}
      <div className="mt-4"><GeminiExplanationButton prompt={`次の問題を、他の選択肢が違う理由も含めて説明してください。\n問題: ${question.question}\n正解: ${String(question.answer)}`} context={question.code} /></div>
    </Card>
  );
}
