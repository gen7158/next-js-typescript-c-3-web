import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TodayRecommendation({ recommendation }: { recommendation: { title: string; description: string; href: string } }) {
  return (
    <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-r from-primary/15 via-surface to-surface p-5">
      <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-glow"><Play className="h-5 w-5 fill-current" /></span>
        <div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a99fff]">Today&apos;s mission</p><h2 className="mt-1 text-lg font-semibold">{recommendation.title}</h2><p className="mt-1 text-xs text-muted">{recommendation.description}</p></div>
        <Link href={recommendation.href} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-background transition hover:bg-[#e8e7ef]">学習を始める <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </Card>
  );
}
