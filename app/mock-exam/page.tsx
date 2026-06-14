"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, ShieldCheck } from "lucide-react";
import { ExamQuestion } from "@/components/exam/ExamQuestion";
import { ExamTimer } from "@/components/exam/ExamTimer";
import type { UserAnswer } from "@/components/practice/QuestionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/data/questions";
import { calculateExamScore } from "@/lib/scoring";
import type { ExamAnswer, ExamHistory } from "@/types/progress";
import { useLearningStore } from "@/store/learningStore";
import { cn } from "@/lib/utils";

function createExamQuestions() {
  const byCategory = new Map<string, typeof questions>();
  questions.forEach((question) => byCategory.set(question.category, [...(byCategory.get(question.category) ?? []), question]));
  const picked = [...byCategory.values()].flatMap((items) => [...items].sort(() => Math.random() - 0.5).slice(0, 2));
  return picked.sort(() => Math.random() - 0.5).slice(0, 30);
}

export default function MockExamPage() {
  const router = useRouter();
  const addExamHistory = useLearningStore((state) => state.addExamHistory);
  const [started, setStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<typeof questions>([]);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [index, setIndex] = useState(0);
  const sections = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ start: i * 5, end: i * 5 + 5 })), []);

  const start = () => { setExamQuestions(createExamQuestions()); setAnswers({}); setIndex(0); setStarted(true); };
  const finish = useCallback(() => {
    if (!examQuestions.length) return;
    const graded: ExamAnswer[] = examQuestions.map((question) => {
      const answer = answers[question.id];
      const correct = typeof question.answer === "string" ? String(answer ?? "").trim().toLowerCase() === question.answer.toLowerCase() : answer === question.answer;
      return { questionId: question.id, correct, category: question.category };
    });
    const score = calculateExamScore(graded);
    const result: ExamHistory = { id: crypto.randomUUID(), takenAt: new Date().toISOString(), score: score.correct, total: score.total, percentage: score.percentage, passed: score.passed, answers: graded };
    addExamHistory(result);
    sessionStorage.setItem("c-pass-lab-latest-result", JSON.stringify(result));
    router.push("/mock-exam/result");
  }, [addExamHistory, answers, examQuestions, router]);

  if (!started) {
    return (
      <div className="animate-in mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-surface to-surface p-7 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white shadow-glow"><ClipboardCheck className="h-6 w-6" /></span>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-[#aaa1ff]">C certification mock exam</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">本番形式の模擬試験</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">30問を大問6つに分けて出題します。試験中は解説を表示せず、終了後に分野別の弱点まで分析します。</p>
          <Button className="mt-7" size="lg" onClick={start}>模擬試験を開始する</Button>
        </section>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5"><Clock3 className="h-5 w-5 text-cyan" /><strong className="mt-3 block">制限時間 60分</strong><p className="mt-2 text-xs text-muted">時間切れで自動採点</p></div>
          <div className="rounded-xl border border-border bg-surface p-5"><ShieldCheck className="h-5 w-5 text-success" /><strong className="mt-3 block">合格ライン 60%</strong><p className="mt-2 text-xs text-muted">18問以上の正解が目安</p></div>
          <div className="rounded-xl border border-border bg-surface p-5"><CheckCircle2 className="h-5 w-5 text-warning" /><strong className="mt-3 block">大問6問形式</strong><p className="mt-2 text-xs text-muted">各セクション5問</p></div>
        </div>
        <div className="mt-5 rounded-xl border border-warning/20 bg-warning/5 p-5 text-xs leading-6 text-warning">開始後はタイマーが止まりません。落ち着いてコードの値を紙に書きながら解きましょう。</div>
      </div>
    );
  }

  const question = examQuestions[index];
  const sectionIndex = Math.floor(index / 5);
  return (
    <div className="animate-in mx-auto max-w-4xl space-y-4">
      <div className="sticky top-20 z-20 rounded-xl border border-border bg-background/90 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.14em] text-muted">大問 {sectionIndex + 1} / 6</p><p className="mt-1 text-sm font-semibold">問 {index + 1} / {examQuestions.length}</p></div><ExamTimer durationSeconds={3600} onTimeUp={finish} /></div>
        <Progress value={((index + 1) / examQuestions.length) * 100} className="mt-3" />
        <div className="mt-3 flex gap-1">{sections.map((section, sectionNumber) => <button key={section.start} onClick={() => setIndex(section.start)} className={cn("h-1.5 flex-1 rounded-full bg-panel", sectionNumber === sectionIndex && "bg-primary", examQuestions.slice(section.start, section.end).every((item) => answers[item.id] !== undefined) && "bg-success")} />)}</div>
      </div>
      {question && <ExamQuestion question={question} number={index + 1} answer={answers[question.id] ?? null} onAnswer={(answer) => setAnswers({ ...answers, [question.id]: answer })} />}
      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft className="h-4 w-4" />前へ</Button>
        <span className="text-[10px] text-muted">{Object.keys(answers).length} / {examQuestions.length} 回答済み</span>
        {index < examQuestions.length - 1 ? <Button onClick={() => setIndex(index + 1)}>次へ<ChevronRight className="h-4 w-4" /></Button> : <Button variant="success" onClick={finish}>採点する</Button>}
      </div>
    </div>
  );
}
