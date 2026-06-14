"use client";

import Link from "next/link";
import { CheckCircle2, LockKeyhole, Trophy } from "lucide-react";
import type { AdvancedLesson } from "@/types/advanced";
import { LessonContent } from "@/components/lesson/LessonContent";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { advancedLessons } from "@/data/advanced-lessons";
import { getAdvancedLessonAccess, getCertificationStatus } from "@/lib/certification";
import { useLearningStore } from "@/store/learningStore";

export function AdvancedLessonGate({ lesson }: { lesson: AdvancedLesson }) {
  const state = useLearningStore();
  const status = getCertificationStatus(state);
  const access = getAdvancedLessonAccess(lesson.id, state.completedAdvancedLessons);

  if (status.advancedUnlocked && access.sequenceReady) {
    return <LessonContent lesson={lesson} miniQuestions={[]} curriculum="advanced" curriculumLessons={advancedLessons} />;
  }

  return (
    <div className="mx-auto max-w-3xl animate-in">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-gradient-to-br from-warning/15 via-surface to-surface p-7 sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-warning/10 text-warning"><LockKeyhole className="h-6 w-6" /></span>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-warning">Advanced curriculum locked</p>
          <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-4 text-sm leading-7 text-muted">{status.advancedUnlocked ? `発展編は前から順番に進みます。先に「${access.previous?.title}」を完了すると、この講座が開きます。` : "発展編は、C言語3級の基礎を一通り学び、模擬試験で合格ラインへ到達すると解放されます。急いで飛ばすより、まず基礎の実行順を確実にしましょう。"}</p>
        </div>
        <div className="space-y-5 p-7 sm:p-9">
          {!status.advancedUnlocked && <div>
            <div className="flex justify-between text-xs"><span className="text-muted">3級レッスン</span><strong>{status.completedCore} / {status.totalCore}</strong></div>
            <Progress value={status.lessonPercentage} className="mt-3" indicatorClassName={status.lessonsReady ? "bg-success" : "bg-primary"} />
          </div>}
          {!status.advancedUnlocked && <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl border border-border bg-background/60 p-4">
              <CheckCircle2 className={status.lessonsReady ? "h-5 w-5 text-success" : "h-5 w-5 text-muted"} />
              <div><strong className="text-sm">全24講座を完了</strong><p className="mt-1 text-xs text-muted">{status.lessonsReady ? "達成済み" : `あと${status.totalCore - status.completedCore}講座`}</p></div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border bg-background/60 p-4">
              <Trophy className={status.examReady ? "h-5 w-5 text-success" : "h-5 w-5 text-muted"} />
              <div><strong className="text-sm">模試60%以上</strong><p className="mt-1 text-xs text-muted">最高 {status.bestExam}%</p></div>
            </div>
          </div>}
          <div className="flex flex-wrap gap-3">
            {status.advancedUnlocked && access.previous && <Link href={`/advanced/${access.previous.id}`} className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold">前の講座へ戻る</Link>}
            {!status.lessonsReady && <Link href="/learn" className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold">3級ロードマップへ</Link>}
            {!status.examReady && <Link href="/mock-exam" className="inline-flex h-11 items-center rounded-lg border border-border bg-panel px-5 text-sm font-semibold">模擬試験へ</Link>}
            <Link href="/advanced" className="inline-flex h-11 items-center rounded-lg border border-border bg-panel px-5 text-sm font-semibold">発展編の全体を見る</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
