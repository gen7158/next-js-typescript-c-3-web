"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, LockKeyhole, Rocket, ShieldCheck, Trophy } from "lucide-react";
import { advancedLessons, advancedLessonsByStage, advancedStages } from "@/data/advanced-lessons";
import { getCertificationStatus } from "@/lib/certification";
import { useLearningStore } from "@/store/learningStore";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stageTone = {
  primary: "border-primary/25 bg-primary/10 text-[#b9b2ff]",
  cyan: "border-cyan/25 bg-cyan/10 text-cyan",
  warning: "border-warning/25 bg-warning/10 text-warning",
  success: "border-success/25 bg-success/10 text-success",
};

export default function AdvancedPage() {
  const state = useLearningStore();
  const status = getCertificationStatus(state);
  const completed = state.completedAdvancedLessons;
  const percentage = Math.round((completed.length / advancedLessons.length) * 100);

  return (
    <div className="animate-in space-y-7">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-surface to-surface p-6 sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2"><Badge className="border-success/25 bg-success/10 text-success">3級合格後</Badge><Badge>20実践講座</Badge><Badge>4制作課題</Badge></div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-[#aaa1ff]">Beyond grade 3</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">合格をゴールにせず、<br /><span className="text-gradient">Cで作れる人へ。</span></h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-muted">3級で身につけた実行順・配列・関数を土台に、構造体、探索、ポインタ、動的メモリ、ファイル、テストへ進みます。最後は保存機能を持つCLI作品まで完成させます。</p>
          </div>
          <Card className="p-5">
            <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.15em] text-muted">Advanced progress</p><strong className="mt-1 block text-2xl">{completed.length} / {advancedLessons.length}</strong></div>{status.advancedUnlocked ? <Rocket className="h-6 w-6 text-success" /> : <LockKeyhole className="h-6 w-6 text-warning" />}</div>
            <Progress value={percentage} className="mt-4" indicatorClassName="bg-gradient-to-r from-primary to-success" />
            <p className="mt-3 text-xs text-muted">{status.advancedUnlocked ? `${percentage}% 完了` : "3級ロードマップ達成後に解放"}</p>
          </Card>
        </div>
      </section>

      {!status.advancedUnlocked && (
        <section className="rounded-2xl border border-warning/25 bg-warning/5 p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning"><ShieldCheck className="h-6 w-6" /></span>
            <div className="flex-1"><h2 className="font-semibold">発展編の解放条件</h2><p className="mt-2 text-xs leading-6 text-muted">基礎を飛ばしてポインタへ進むとつまずきやすいため、3級講座の完了と模試合格を入口にしています。</p></div>
            <div className="grid min-w-[280px] gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background/50 p-3"><span className="flex items-center gap-2 text-xs font-semibold"><CheckCircle2 className={cn("h-4 w-4", status.lessonsReady ? "text-success" : "text-muted")} />全講座完了</span><p className="mt-1 text-[10px] text-muted">{status.completedCore}/{status.totalCore}</p></div>
              <div className="rounded-lg border border-border bg-background/50 p-3"><span className="flex items-center gap-2 text-xs font-semibold"><Trophy className={cn("h-4 w-4", status.examReady ? "text-success" : "text-muted")} />模試60%</span><p className="mt-1 text-[10px] text-muted">最高 {status.bestExam}%</p></div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/learn" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-xs font-semibold">3級講座を進める</Link><Link href="/mock-exam" className="inline-flex h-10 items-center rounded-lg border border-border bg-panel px-4 text-xs font-semibold">模擬試験を受ける</Link></div>
        </section>
      )}

      <section className="space-y-6">
        {advancedStages.map((stage) => {
          const stageLessons = advancedLessonsByStage(stage.id);
          return (
            <div key={stage.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
                <span className={cn("grid h-10 w-10 place-items-center rounded-xl border font-mono text-sm font-bold", stageTone[stage.color])}>{stage.order}</span>
                <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{stage.title}</h2><span className="text-[10px] text-muted">{stage.subtitle}</span></div><p className="mt-1 text-xs leading-6 text-muted">{stage.description}</p></div>
                <Badge>{stageLessons.length}講座</Badge>
              </div>
              <div className="grid gap-px bg-border md:grid-cols-2">
                {stageLessons.map((lesson) => {
                  const globalIndex = advancedLessons.findIndex((item) => item.id === lesson.id);
                  const previous = advancedLessons[globalIndex - 1];
                  const done = completed.includes(lesson.id);
                  const available = status.advancedUnlocked && (!previous || completed.includes(previous.id));
                  return (
                    <article key={lesson.id} className="flex min-h-52 flex-col bg-surface p-5">
                      <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-muted">ADV {String(globalIndex + 1).padStart(2, "0")}</span>{done ? <Badge className="border-success/25 bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />完了</Badge> : !available ? <LockKeyhole className="h-4 w-4 text-muted" /> : <Code2 className="h-4 w-4 text-cyan" />}</div>
                      <h3 className="mt-4 font-semibold">{lesson.title}</h3>
                      <p className="mt-2 flex-1 text-xs leading-6 text-muted">{lesson.summary}</p>
                      <div className="mt-4 rounded-lg bg-background/60 p-3"><p className="text-[9px] font-bold uppercase tracking-[.13em] text-muted">成果物</p><p className="mt-1 text-xs text-[#cbd0da]">{lesson.deliverable}</p></div>
                      <Link href={`/advanced/${lesson.id}`} className={cn("mt-4 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold", available ? "text-[#b8afff]" : "text-muted")}>{available ? "講座を始める" : status.advancedUnlocked ? "前の講座を完了すると解放" : "3級達成後に解放"}<ArrowRight className="h-4 w-4" /></Link>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
