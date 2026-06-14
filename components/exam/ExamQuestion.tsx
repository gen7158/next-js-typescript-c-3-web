"use client";

import type { Question } from "@/types/question";
import type { UserAnswer } from "@/components/practice/QuestionCard";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExamQuestion({ question, number, answer, onAnswer }: { question: Question; number: number; answer: UserAnswer; onAnswer: (answer: UserAnswer) => void }) {
  const choices = question.type === "trueFalse" ? ["正しい", "誤り"] : question.choices;
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="flex items-center gap-2"><Badge>問 {number}</Badge><Badge>{question.category}</Badge></div>
      <h2 className="mt-5 text-base font-semibold leading-7">{question.question}</h2>
      {question.code && <div className="mt-5"><CodeBlock code={question.code} /></div>}
      {choices ? <div className="mt-5 grid gap-2">{choices.map((choice, index) => {
        const value = question.type === "trueFalse" ? index === 0 : index;
        return <button key={`${choice}-${index}`} onClick={() => onAnswer(value)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background/50 p-3 text-left text-sm hover:border-primary/50", answer === value && "border-primary bg-primary/10")}><span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-border text-[11px]">{String.fromCharCode(65 + index)}</span>{choice}</button>;
      })}</div> : <input value={typeof answer === "string" ? answer : ""} onChange={(event) => onAnswer(event.target.value)} className="mt-5 h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-primary" placeholder="答えを入力" />}
    </section>
  );
}
