"use client";

import Link from "next/link";
import { Award, BookOpenCheck, CheckCircle2, RotateCcw, Target, XCircle } from "lucide-react";
import type { ExamHistory } from "@/types/progress";
import { questionById } from "@/data/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WeaknessAnalysis } from "@/components/exam/WeaknessAnalysis";
import { useLearningStore } from "@/store/learningStore";

export function ExamResult({ result }: { result: ExamHistory }) {
  const addReviewItems = useLearningStore((state) => state.addReviewItems);
  const categoryMap = new Map<string, { correct: number; total: number }>();
  result.answers.forEach((answer) => {
    const current = categoryMap.get(answer.category) ?? { correct: 0, total: 0 };
    current.total += 1; if (answer.correct) current.correct += 1; categoryMap.set(answer.category, current);
  });
  const categories = [...categoryMap].map(([category, value]) => ({ category, accuracy: Math.round(value.correct / value.total * 100) })).sort((a, b) => a.accuracy - b.accuracy);
  const wrong = result.answers.filter((answer) => !answer.correct);
  const strongest = [...categories].sort((a, b) => b.accuracy - a.accuracy)[0];
  const weakest = categories[0];
  return (
    <div className="animate-in mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-surface to-surface p-7 text-center">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${result.passed ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>{result.passed ? <Award className="h-7 w-7" /> : <Target className="h-7 w-7" />}</span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-muted">Mock exam result</p>
        <h1 className="mt-2 text-3xl font-bold">{result.passed ? "合格ライン達成！" : "あと少しで合格です"}</h1>
        <div className="mt-5"><span className="text-6xl font-bold tracking-tighter">{result.percentage}</span><span className="text-xl text-muted">%</span></div>
        <p className="mt-2 text-sm text-muted">{result.score} / {result.total} 問正解 ・ 合格ライン60%</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5"><CheckCircle2 className="h-5 w-5 text-success" /><p className="mt-3 text-[10px] text-muted">得意分野</p><strong className="mt-1 block text-sm">{strongest?.category ?? "--"}</strong></Card>
        <Card className="p-5"><XCircle className="h-5 w-5 text-danger" /><p className="mt-3 text-[10px] text-muted">苦手分野</p><strong className="mt-1 block text-sm">{weakest?.category ?? "--"}</strong></Card>
        <Card className="p-5"><BookOpenCheck className="h-5 w-5 text-cyan" /><p className="mt-3 text-[10px] text-muted">次に学ぶ</p><strong className="mt-1 block text-sm">{weakest?.category ?? "コード読解"}</strong></Card>
      </div>
      <Card className="p-6"><h2 className="font-semibold">分野別正答率</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{categories.map((item) => <div key={item.category}><div className="mb-2 flex justify-between text-xs"><span>{item.category}</span><strong>{item.accuracy}%</strong></div><Progress value={item.accuracy} indicatorClassName={item.accuracy >= 60 ? "bg-success" : "bg-danger"} /></div>)}</div></Card>
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">間違えた問題</h2><p className="mt-1 text-xs text-muted">{wrong.length}問を確認して復習できます。</p></div><Button variant="secondary" size="sm" onClick={() => addReviewItems(wrong.map((item) => item.questionId))}>すべて復習へ追加</Button></div>
        <div className="mt-4 space-y-2">{wrong.slice(0, 8).map((item) => <div key={item.questionId} className="rounded-lg border border-border bg-background/50 p-3 text-xs"><span className="mr-2 font-mono text-danger">×</span>{questionById[item.questionId]?.question}</div>)}</div>
      </Card>
      <WeaknessAnalysis categories={categories} />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href="/mock-exam" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold"><RotateCcw className="h-4 w-4" />再受験する</Link><Link href="/practice?mode=review" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-panel px-5 text-sm font-semibold">間違いを復習</Link></div>
    </div>
  );
}
