"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Bot, BrainCircuit, CheckCircle2, ClipboardCheck, Flame, Gauge, LockKeyhole, PlayCircle, Rocket, Sparkles, Target, Trophy } from "lucide-react";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { StudyRouteCard } from "@/components/dashboard/StudyRouteCard";
import { TodayRecommendation } from "@/components/dashboard/TodayRecommendation";
import { WeaknessCard } from "@/components/dashboard/WeaknessCard";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateAccuracy, extractWeakCategories, getPassProbability } from "@/lib/scoring";
import { calculateOverallProgress, calculateStudyStreak, getTodayRecommendation } from "@/lib/progress";
import { useLearningStore } from "@/store/learningStore";
import { getCertificationStatus } from "@/lib/certification";
import { advancedLessons } from "@/data/advanced-lessons";

export default function DashboardPage() {
  const state = useLearningStore();
  const accuracy = calculateAccuracy(state.attempts);
  const progress = calculateOverallProgress(state);
  const streak = calculateStudyStreak(state.studyDates);
  const latestExam = state.examHistory.at(-1);
  const pass = getPassProbability(accuracy, latestExam?.percentage);
  const weaknesses = extractWeakCategories(state.attempts);
  const solved = new Set(state.attempts.map((attempt) => attempt.questionId)).size;
  const recommendation = getTodayRecommendation(state);
  const certification = getCertificationStatus(state);
  const advancedPercentage = Math.round((state.completedAdvancedLessons.length / advancedLessons.length) * 100);

  return (
    <div className="animate-in space-y-7">
      <section className="grid gap-6 lg:grid-cols-[1.45fr_.55fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-full w-2/5 bg-[radial-gradient(circle_at_center,rgba(124,108,242,.22),transparent_62%)]" />
          <div className="relative max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a99fff]">Your C journey starts here</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">合格に必要なことを、<br /><span className="text-gradient">迷わず一つずつ。</span></h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted">まず24講座・102問・模擬試験で3級合格へ。その後はポインタ、アルゴリズム、ファイル処理、制作課題へ進み、C言語を使える力へ育てます。</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={recommendation.href} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold shadow-glow"><PlayCircle className="h-4 w-4" /> 学習を始める</Link>
              <Link href="/practice" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-panel px-5 text-sm font-semibold"><BrainCircuit className="h-4 w-4" /> 問題演習</Link>
              <Link href="/advanced" className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-5 text-sm font-semibold text-[#c0baff]"><Rocket className="h-4 w-4" /> 合格後の発展編</Link>
            </div>
          </div>
        </div>
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-muted">Pass readiness</p><h3 className="mt-1 font-semibold">合格可能性</h3></div><Gauge className="h-5 w-5 text-success" /></div>
          <div className="my-5 text-center"><span className="text-5xl font-bold tracking-tighter">{pass.value}</span><span className="ml-1 text-lg text-muted">%</span><p className="mt-2 text-xs font-semibold text-success">{pass.label}</p></div>
          <Progress value={pass.value} indicatorClassName="bg-gradient-to-r from-primary to-success" />
          <p className="mt-3 text-center text-[10px] text-muted">学習・演習・模試の結果から算出</p>
        </Card>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 font-mono text-xs font-bold text-[#b8afff]">01</span><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted">Primary goal</p><h2 className="font-semibold">C言語3級に合格する</h2></div></div>
            <p className="mt-4 text-xs leading-6 text-muted">基本構文、コード読解、実行結果予測を学び、模試60%以上を目指します。</p>
            <div className="mt-4 flex items-center gap-3"><Progress value={certification.lessonPercentage} className="flex-1" /><strong className="text-xs">{certification.completedCore}/{certification.totalCore}</strong></div>
            <div className="mt-3 flex gap-2"><span className="rounded-full bg-panel px-3 py-1 text-[10px] text-muted">講座 {certification.lessonPercentage}%</span><span className="rounded-full bg-panel px-3 py-1 text-[10px] text-muted">模試最高 {certification.bestExam}%</span></div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 font-mono text-xs font-bold text-cyan">02</span><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted">Next journey</p><h2 className="font-semibold">C言語で作品を作れるようになる</h2></div>{certification.advancedUnlocked ? <CheckCircle2 className="ml-auto h-5 w-5 text-success" /> : <LockKeyhole className="ml-auto h-5 w-5 text-muted" />}</div>
            <p className="mt-4 text-xs leading-6 text-muted">20の実践講座を順に進み、最後はファイル保存ToDoやCSV分析CLIを完成させます。</p>
            <div className="mt-4 flex items-center gap-3"><Progress value={advancedPercentage} className="flex-1" indicatorClassName="bg-cyan" /><strong className="text-xs">{state.completedAdvancedLessons.length}/{advancedLessons.length}</strong></div>
            <Link href="/advanced" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan">発展ロードマップを見る<ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ProgressCard label="総合進捗" value={`${progress}%`} note={`${state.completedLessons.length}レッスン完了`} icon={Target} />
        <ProgressCard label="全体正答率" value={`${Math.round(accuracy)}%`} note={`${solved}問に挑戦`} icon={CheckCircle2} tone="success" />
        <ProgressCard label="連続学習" value={`${streak}日`} note="今日も続けよう" icon={Flame} tone="warning" />
        <ProgressCard label="最新模試" value={latestExam ? `${latestExam.percentage}%` : "--"} note={latestExam ? (latestExam.passed ? "合格ライン達成" : "復習して再挑戦") : "まだ受験していません"} icon={Trophy} tone="cyan" />
      </section>

      <TodayRecommendation recommendation={recommendation} />

      <section className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div>
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Learning paths</p><h2 className="mt-1 text-xl font-semibold">あなたに合う学習ルート</h2></div><Link href="/learn" className="hidden items-center gap-1 text-xs font-semibold text-muted hover:text-white sm:flex">すべて見る <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <div className="grid gap-4 md:grid-cols-3">
            <StudyRouteCard title="最短合格ルート" description="頻出分野を優先し、限られた時間で合格ラインを目指します。" items={["printf", "if文", "for文", "配列"]} icon={Rocket} accent="primary" badge="最短" />
            <StudyRouteCard title="初心者じっくり" description="C言語の基本から順番に、理解を積み上げていきます。" items={["基本", "変数", "演算子", "条件分岐"]} icon={BookOpen} accent="cyan" badge="おすすめ" />
            <StudyRouteCard title="苦手克服ルート" description="回答履歴から弱点を見つけ、復習問題を優先します。" items={weaknesses.map((item) => item.category).concat(["自動分析"]).slice(0, 4)} icon={Sparkles} accent="warning" badge="自動" />
          </div>
        </div>
        <WeaknessCard weaknesses={weaknesses} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/mock-exam" className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"><span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-[#aaa1ff]"><ClipboardCheck className="h-5 w-5" /></span><span><strong className="block text-sm">模擬試験</strong><span className="text-[11px] text-muted">60分・本番形式</span></span></Link>
        <Link href="/ai-tutor" className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"><span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/10 text-cyan"><Bot className="h-5 w-5" /></span><span><strong className="block text-sm">AIに質問する</strong><span className="text-[11px] text-muted">6つの学習モード</span></span></Link>
        <Link href="/practice?mode=review" className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"><span className="grid h-10 w-10 place-items-center rounded-lg bg-warning/10 text-warning"><BrainCircuit className="h-5 w-5" /></span><span><strong className="block text-sm">復習リスト</strong><span className="text-[11px] text-muted">{state.reviewQuestionIds.length}問を保存中</span></span></Link>
      </section>
    </div>
  );
}
