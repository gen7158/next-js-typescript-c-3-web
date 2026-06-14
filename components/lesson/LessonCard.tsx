"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Gauge, HelpCircle } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const levelLabel = { basic: "基礎", standard: "標準", exam: "試験", advanced: "発展" };

export function LessonCard({ lesson, completed, accuracy }: { lesson: Lesson; completed: boolean; accuracy?: number }) {
  return (
    <Card className="group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2"><Badge>{levelLabel[lesson.level]}</Badge>{completed && <Badge className="border-success/20 bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />完了</Badge>}</div>
        <span className="text-[10px] text-muted">{lesson.questionCount}問</span>
      </div>
      <h2 className="mt-4 font-semibold">{lesson.title}</h2>
      <p className="mt-2 flex-1 text-xs leading-6 text-muted">{lesson.summary}</p>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] text-muted">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.estimatedMinutes}分</span>
        <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{completed ? "100%" : "0%"}</span>
        <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />苦手度 {accuracy === undefined ? "--" : `${100 - accuracy}%`}</span>
      </div>
      <Progress value={completed ? 100 : 0} className="mt-3" indicatorClassName={completed ? "bg-success" : "bg-primary"} />
      <Link href={`/learn/${lesson.id}`} className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-[#b4acff]">学習する <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
    </Card>
  );
}
