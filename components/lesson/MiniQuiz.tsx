"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/types/question";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MiniQuiz({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const question = questions[index];
  if (!question || !question.choices) return null;
  const correct = selected === question.answer;
  return (
    <div className="rounded-xl border border-border bg-background/50 p-5">
      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-muted"><span>Mini check</span><span>{index + 1} / {questions.length}</span></div>
      <h3 className="mt-4 text-sm font-semibold leading-6">{question.question}</h3>
      <div className="mt-4 grid gap-2">
        {question.choices.map((choice, choiceIndex) => (
          <button key={choice} onClick={() => setSelected(choiceIndex)} disabled={selected !== null} className={cn("rounded-lg border border-border bg-panel p-3 text-left text-xs transition hover:border-primary/50", selected === choiceIndex && (correct ? "border-success bg-success/10 text-success" : "border-danger bg-danger/10 text-danger"), selected !== null && choiceIndex === question.answer && "border-success bg-success/10 text-success")}>{choice}</button>
        ))}
      </div>
      {selected !== null && <div className={cn("mt-4 rounded-lg p-4 text-xs leading-6", correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}><div className="mb-1 flex items-center gap-2 font-semibold">{correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{correct ? "正解です" : "もう一度ポイントを確認しましょう"}</div><p className="text-[#c7cbd5]">{question.explanation}</p></div>}
      {selected !== null && index < questions.length - 1 && <Button className="mt-4" size="sm" onClick={() => { setIndex(index + 1); setSelected(null); }}>次の問題</Button>}
    </div>
  );
}
