"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, Lightbulb, ListChecks, MessageCircleQuestion } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import type { Question } from "@/types/question";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { MiniQuiz } from "@/components/lesson/MiniQuiz";
import { GeminiExplanationButton } from "@/components/gemini/GeminiExplanationButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/store/learningStore";

export function LessonContent({ lesson, miniQuestions }: { lesson: Lesson; miniQuestions: Question[] }) {
  const completed = useLearningStore((state) => state.completedLessons.includes(lesson.id));
  const completeLesson = useLearningStore((state) => state.completeLesson);
  return (
    <article className="animate-in mx-auto max-w-4xl">
      <Link href="/learn" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-white"><ArrowLeft className="h-4 w-4" />ロードマップへ戻る</Link>
      <header className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-wrap gap-2"><Badge>{lesson.level === "basic" ? "基礎" : lesson.level === "standard" ? "標準" : "試験対策"}</Badge><Badge>{lesson.estimatedMinutes}分</Badge>{completed && <Badge className="border-success/30 bg-success/10 text-success">完了済み</Badge>}</div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{lesson.summary}</p>
      </header>

      <div className="space-y-5">
        <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-5 w-5 text-warning" />なぜ必要？</h2><p className="mt-4 text-sm leading-8 text-[#cbd0da]">{lesson.whyItMatters}</p></Card>
        <Card className="p-6"><h2 className="font-semibold">基本の考え方</h2><div className="mt-4 whitespace-pre-line text-sm leading-8 text-[#cbd0da]">{lesson.content}</div></Card>
        {lesson.codeExamples.map((example) => (
          <Card key={example.title} className="p-6">
            <h2 className="font-semibold">{example.title}</h2><p className="mb-4 mt-2 text-xs leading-6 text-muted">{example.explanation}</p>
            <CodeBlock code={example.code} />
            {example.lineByLine && <div className="mt-5 space-y-2">{example.lineByLine.map((line, index) => <div key={`${line}-${index}`} className="flex gap-3 rounded-lg bg-panel/60 p-3 text-xs leading-5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-primary/15 font-mono text-[10px] text-[#b0a8ff]">{index + 1}</span><span className="text-[#cbd0da]">{line}</span></div>)}</div>}
          </Card>
        ))}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5 text-danger" />よくある間違い</h2><ul className="mt-4 space-y-3">{lesson.commonMistakes.map((item) => <li key={item} className="flex gap-2 text-xs leading-6 text-[#cbd0da]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />{item}</li>)}</ul></Card>
          <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><ListChecks className="h-5 w-5 text-cyan" />試験ポイント</h2><ul className="mt-4 space-y-3">{lesson.examPoints.map((item) => <li key={item} className="flex gap-2 text-xs leading-6 text-[#cbd0da]"><CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-cyan" />{item}</li>)}</ul></Card>
        </div>
        <Card className="p-6"><h2 className="mb-4 font-semibold">ミニ確認問題</h2><MiniQuiz questions={miniQuestions} /></Card>
        <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><MessageCircleQuestion className="h-5 w-5 text-[#aaa1ff]" />わからないところをAIに聞く</h2><p className="mb-4 mt-2 text-xs text-muted">このレッスンの内容を含めてGeminiへ質問します。</p><GeminiExplanationButton prompt={`${lesson.title}について、初心者が間違えやすい点を例題付きで説明してください。`} context={lesson.content} /></Card>
        <div className="flex flex-col items-center rounded-2xl border border-primary/25 bg-primary/10 p-7 text-center">
          <CheckCircle2 className="h-9 w-9 text-success" /><h2 className="mt-3 text-lg font-semibold">{completed ? "このレッスンは完了済みです" : "理解できたら完了にしましょう"}</h2>
          <p className="mt-2 text-xs text-muted">あとから何度でも読み直せます。</p>
          {!completed && <Button className="mt-5" onClick={() => completeLesson(lesson.id)}>レッスンを完了する</Button>}
          {completed && <Link href={`/practice?category=${encodeURIComponent(lesson.category)}`} className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold">関連問題を解く</Link>}
        </div>
      </div>
    </article>
  );
}
