"use client";

import { Bookmark, Check, Heart } from "lucide-react";
import type { Question } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { cn } from "@/lib/utils";

export type UserAnswer = string | number | boolean | null;

export function QuestionCard({ question, answer, submitted, favorite, review, onAnswer, onSubmit, onFavorite, onReview }: {
  question: Question;
  answer: UserAnswer;
  submitted: boolean;
  favorite: boolean;
  review: boolean;
  onAnswer: (value: UserAnswer) => void;
  onSubmit: () => void;
  onFavorite: () => void;
  onReview: () => void;
}) {
  const choices = question.type === "trueFalse" ? ["正しい", "誤り"] : question.choices;
  const valueForChoice = (index: number): string | number | boolean => question.type === "trueFalse" ? index === 0 : index;
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-primary/20 bg-primary/10 text-[#b1a9ff]">{question.category}</Badge>
        <Badge>{question.difficulty}</Badge><Badge>{question.type}</Badge>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" onClick={onFavorite} aria-label="お気に入り"><Heart className={cn("h-4 w-4", favorite && "fill-danger text-danger")} /></Button>
          <Button variant="ghost" size="icon" onClick={onReview} aria-label="復習リスト"><Bookmark className={cn("h-4 w-4", review && "fill-warning text-warning")} /></Button>
        </div>
      </div>
      <h2 className="mt-5 text-base font-semibold leading-7 sm:text-lg">{question.question}</h2>
      {question.code && <div className="mt-5"><CodeBlock code={question.code} /></div>}
      {choices ? (
        <div className="mt-5 grid gap-2">
          {choices.map((choice, index) => {
            const choiceValue = valueForChoice(index);
            const selected = answer === choiceValue;
            return <button key={`${choice}-${index}`} disabled={submitted} onClick={() => onAnswer(choiceValue)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background/50 p-3 text-left text-sm transition hover:border-primary/50", selected && "border-primary bg-primary/10", submitted && choiceValue === question.answer && "border-success bg-success/10 text-success", submitted && selected && choiceValue !== question.answer && "border-danger bg-danger/10 text-danger")}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border font-mono text-[11px]">{question.type === "trueFalse" ? (index === 0 ? "○" : "×") : String.fromCharCode(65 + index)}</span><span>{choice}</span>{submitted && choiceValue === question.answer && <Check className="ml-auto h-4 w-4" />}</button>;
          })}
        </div>
      ) : (
        <input value={typeof answer === "string" ? answer : ""} onChange={(event) => onAnswer(event.target.value)} disabled={submitted} placeholder="答えを入力してください" className="mt-5 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary" />
      )}
      {!submitted && <Button className="mt-6 w-full sm:w-auto" onClick={onSubmit} disabled={answer === null || answer === ""}>回答する</Button>}
    </div>
  );
}
