"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Map, Rocket } from "lucide-react";
import { LessonCard } from "@/components/lesson/LessonCard";
import { Progress } from "@/components/ui/progress";
import { lessons } from "@/data/lessons";
import { calculateCategoryAccuracy } from "@/lib/scoring";
import { useLearningStore } from "@/store/learningStore";

export default function LearnPage() {
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const attempts = useLearningStore((state) => state.attempts);
  const accuracies = calculateCategoryAccuracy(attempts);
  const percentage = Math.round((completedLessons.length / lessons.length) * 100);
  return (
    <div className="animate-in">
      <section className="mb-7 overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/15 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#aaa1ff]">{lessons.length} certification modules</p><h1 className="mt-3 text-3xl font-bold tracking-tight">3級合格までの学習ロードマップ</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">この24講座は試験範囲に集中しています。上から順番に進めると、C言語の基本から試験レベルのコード読解まで無理なく身につきます。</p></div>
          <div className="min-w-52 rounded-xl border border-border bg-background/50 p-4"><div className="flex justify-between text-xs"><span className="text-muted">レッスン進捗</span><strong>{completedLessons.length} / {lessons.length}</strong></div><Progress value={percentage} className="mt-3" /><p className="mt-2 text-right text-[10px] text-muted">{percentage}% 完了</p></div>
        </div>
      </section>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4"><Map className="h-4 w-4 text-[#aaa1ff]" /><strong className="mt-2 block text-lg">{lessons.length}</strong><span className="text-[10px] text-muted">総レッスン</span></div>
        <div className="rounded-xl border border-border bg-surface p-4"><CheckCircle2 className="h-4 w-4 text-success" /><strong className="mt-2 block text-lg">{completedLessons.length}</strong><span className="text-[10px] text-muted">完了済み</span></div>
        <div className="rounded-xl border border-border bg-surface p-4"><Clock className="h-4 w-4 text-cyan" /><strong className="mt-2 block text-lg">{Math.round(lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0) / 60)}h</strong><span className="text-[10px] text-muted">学習目安</span></div>
      </div>
      <div className="mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-[#aaa1ff]" /><h2 className="text-lg font-semibold">レッスン一覧</h2></div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} completed={completedLessons.includes(lesson.id)} accuracy={accuracies[lesson.category]} />)}</div>
      <section className="mt-7 flex flex-col gap-5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-surface to-surface p-6 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-[#b7afff]"><Rocket className="h-6 w-6" /></span>
        <div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#aaa1ff]">After certification</p><h2 className="mt-1 font-semibold">3級達成後も、C言語の学習は続けられます</h2><p className="mt-2 text-xs leading-6 text-muted">ポインタ、構造体、アルゴリズム、ファイル、テスト、4つの制作課題へ進む20講座を用意しました。</p></div>
        <Link href="/advanced" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-panel px-5 text-sm font-semibold">発展編を見る<ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
