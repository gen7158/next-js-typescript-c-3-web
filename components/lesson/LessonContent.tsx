"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Bot, CheckCircle2, Code2, Flag, GraduationCap, Lightbulb, ListChecks, PlayCircle, RotateCcw, Save, Sparkles, Target, X } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import type { Question } from "@/types/question";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { CodeExercise } from "@/components/lesson/CodeExercise";
import { MiniQuiz } from "@/components/lesson/MiniQuiz";
import { GeminiTutorPanel } from "@/components/gemini/GeminiTutorPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lessons } from "@/data/lessons";
import { useLearningStore } from "@/store/learningStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { BeginnerPrimer } from "@/components/lesson/BeginnerPrimer";

type Tab = "guide" | "examples" | "exercise" | "ai" | "summary";
const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "guide", label: "解説", icon: BookOpen },
  { id: "examples", label: "コード例", icon: Code2 },
  { id: "exercise", label: "演習", icon: PlayCircle },
  { id: "ai", label: "AI解説", icon: Bot },
  { id: "summary", label: "まとめ", icon: Flag },
];

function BulletList({ items, tone = "primary" }: { items: string[]; tone?: "primary" | "warning" | "success" }) {
  const colors = { primary: "bg-primary", warning: "bg-warning", success: "bg-success" };
  return <ul className="space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-[#cbd0da]"><span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", colors[tone])} />{item}</li>)}</ul>;
}

export function LessonContent({
  lesson,
  miniQuestions,
  curriculum = "certification",
  curriculumLessons = lessons,
}: {
  lesson: Lesson;
  miniQuestions: Question[];
  curriculum?: "certification" | "advanced";
  curriculumLessons?: Lesson[];
}) {
  const [tab, setTab] = useState<Tab>("guide");
  const [sessionCode, setSessionCode] = useState(lesson.exercises[0]?.starterCode ?? "");
  const [exerciseSession, setExerciseSession] = useState(0);
  const [reattendOpen, setReattendOpen] = useState(false);
  const [promptedLessonId, setPromptedLessonId] = useState("");
  const [initializedLessonId, setInitializedLessonId] = useState("");
  const router = useRouter();
  const hydrated = useLearningStore((state) => state.hydrated);
  const completed = useLearningStore((state) => curriculum === "advanced"
    ? state.completedAdvancedLessons.includes(lesson.id)
    : state.completedLessons.includes(lesson.id));
  const completeLesson = useLearningStore((state) => state.completeLesson);
  const completeAdvancedLesson = useLearningStore((state) => state.completeAdvancedLesson);
  const lessonCodeRecord = useLearningStore((state) => state.lessonCodeRecords[lesson.id]);
  const saveLessonCode = useLearningStore((state) => state.saveLessonCode);
  const resetLessonCode = useLearningStore((state) => state.resetLessonCode);
  const setAiContext = useUIStore((state) => state.setAiContext);
  const setAiDrawerOpen = useUIStore((state) => state.setAiDrawerOpen);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const lessonIndex = curriculumLessons.findIndex((item) => item.id === lesson.id);
  const previous = curriculumLessons[lessonIndex - 1];
  const next = curriculumLessons[lessonIndex + 1];
  const basePath = curriculum === "advanced" ? "/advanced" : "/learn";
  const courseLabel = curriculum === "advanced" ? "合格後の発展編" : "C言語3級対策";

  useEffect(() => {
    const starter = lesson.exercises[0]?.starterCode ?? "";
    if (!hydrated || initializedLessonId === lesson.id) return;
    setInitializedLessonId(lesson.id);
    if (completed && lessonCodeRecord && promptedLessonId !== lesson.id) {
      setReattendOpen(true);
      setPromptedLessonId(lesson.id);
      return;
    }
    setSessionCode(lessonCodeRecord?.code ?? starter);
  }, [completed, hydrated, initializedLessonId, lesson.id, lesson.exercises, lessonCodeRecord, promptedLessonId]);

  useEffect(() => {
    setAiContext({
      title: lesson.title,
      lesson: [
        lesson.summary,
        `学習目標: ${lesson.learningGoals.join("、")}`,
        `初心者の注意点: ${lesson.beginnerPitfalls.join("、")}`,
        `試験での出方: ${lesson.examPattern}`,
      ].join("\n"),
    });
  }, [lesson, setAiContext]);

  useEffect(() => {
    if (tab === "exercise") setSidebarCollapsed(true);
  }, [tab, setSidebarCollapsed]);

  return (
    <article className={cn("animate-in", tab === "exercise" ? "max-w-none" : "mx-auto max-w-6xl")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href={basePath} className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-white"><ArrowLeft className="h-4 w-4" />{courseLabel}ロードマップ</Link>
        <div className="flex gap-2">
          {previous && <Link href={`${basePath}/${previous.id}`} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-panel px-3 text-xs font-semibold text-muted hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />前へ</Link>}
          {next && <Link href={`${basePath}/${next.id}`} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-panel px-3 text-xs font-semibold text-muted hover:text-white">次へ<ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </div>

      <header className="mb-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2"><Badge>{curriculum === "advanced" ? "ADVANCED" : "GRADE 3"} · STEP {lessonIndex + 1}</Badge><Badge>{lesson.level === "basic" ? "基礎" : lesson.level === "standard" ? "標準" : curriculum === "advanced" ? "実践" : "試験対策"}</Badge><Badge>{lesson.estimatedMinutes}分</Badge>{completed && <Badge className="border-success/30 bg-success/10 text-success">完了済み</Badge>}</div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
            <p className="mt-4 text-sm leading-8 text-[#b8bfcd]">{lesson.summary}</p>
          </div>
          <Button variant="secondary" onClick={() => setAiDrawerOpen(true)}><Bot className="h-4 w-4 text-[#aaa1ff]" />このレッスンをAIに質問</Button>
        </div>
      </header>

      <div className="sticky top-16 z-20 mb-5 overflow-x-auto border-b border-border bg-background/90 backdrop-blur">
        <div className="flex min-w-max gap-1">
          {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={cn("flex h-12 items-center gap-2 border-b-2 border-transparent px-4 text-xs font-semibold text-muted transition hover:text-white", tab === item.id && "border-primary text-white")}><item.icon className="h-4 w-4" />{item.label}</button>)}
        </div>
      </div>

      {tab === "guide" && <div className="space-y-5">
        <BeginnerPrimer lesson={lesson} />
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Target className="h-5 w-5 text-[#aaa1ff]" />このレッスンで学ぶこと</h2><div className="mt-5"><BulletList items={lesson.learningGoals} /></div></Card>
          <Card className="p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Flag className="h-5 w-5 text-success" />今日のゴール</h2><p className="mt-5 text-sm leading-8 text-[#cbd0da]">{lesson.todayGoal}</p></Card>
        </section>

        <Card className="p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#aaa1ff]">Why it matters</p><h2 className="mt-2 flex items-center gap-2 text-xl font-semibold"><Lightbulb className="h-5 w-5 text-warning" />なぜ重要なのか</h2><p className="mt-5 text-sm leading-8 text-[#cbd0da]">{lesson.whyImportant}</p><p className="mt-4 text-sm leading-8 text-[#cbd0da]">{lesson.whyItMatters} 初めて学ぶ段階では、正解を急ぐよりも「この行を実行すると、どの値がどう変わるか」を声に出して確認するほうが定着します。</p></Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="h-5 w-5 text-warning" />初心者がつまずきやすい理由</h2><div className="mt-5"><BulletList items={lesson.beginnerPitfalls} tone="warning" /></div></Card>
          <Card className="p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><GraduationCap className="h-5 w-5 text-cyan" />{curriculum === "advanced" ? "実務・上位学習では？" : "3級ではどう問われる？"}</h2><p className="mt-5 text-sm leading-8 text-[#cbd0da]">{lesson.examPattern}</p></Card>
        </div>

        <Card className="p-6 sm:p-8"><h2 className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="h-5 w-5 text-success" />最初に覚えるポイント</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{lesson.keyPoints.map((item, index) => <div key={item} className="flex gap-3 rounded-xl border border-border bg-background/50 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-success/10 font-mono text-xs text-success">{index + 1}</span><p className="text-sm leading-6 text-[#cbd0da]">{item}</p></div>)}</div></Card>

        {lesson.contentSections.map((section, index) => <Card key={section.title} className="p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Section {index + 1}</p><h2 className="mt-2 text-xl font-semibold">{section.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#cbd0da]">{section.body}</p>{section.code && <div className="mt-5"><CodeBlock code={section.code} /></div>}</Card>)}

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5 text-danger" />よくある間違い</h2><div className="mt-4"><BulletList items={lesson.commonMistakes} tone="warning" /></div></Card>
          <Card className="p-6"><h2 className="flex items-center gap-2 font-semibold"><GraduationCap className="h-5 w-5 text-cyan" />試験ポイント</h2><div className="mt-4"><BulletList items={lesson.examPoints} /></div></Card>
        </div>
        {miniQuestions.length > 0 && <Card className="p-6"><h2 className="mb-4 font-semibold">ミニ確認問題</h2><MiniQuiz questions={miniQuestions} /></Card>}
        <div className="flex justify-end"><Button onClick={() => setTab("examples")}>コード例へ進む<ArrowRight className="h-4 w-4" /></Button></div>
      </div>}

      {tab === "examples" && <div className="space-y-5">
        {lesson.codeExamples.map((example) => <Card key={example.title} className="p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-cyan">Code example</p><h2 className="mt-2 text-xl font-semibold">{example.title}</h2><p className="mt-3 text-sm leading-7 text-muted">{example.description}</p><div className="mt-5"><CodeBlock code={example.code} /></div>{example.output !== undefined && <div className="mt-4 rounded-xl border border-border bg-[#080a0f] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">実行結果</p><pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-cyan">{example.output || "画面への出力なし"}</pre></div>}<p className="mt-5 text-sm leading-8 text-[#cbd0da]">{example.explanation}</p>{example.lineByLine && <div className="mt-5 space-y-2">{example.lineByLine.map((line, index) => <div key={`${line}-${index}`} className="flex gap-3 rounded-lg bg-panel/60 p-4 text-sm leading-6"><span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-primary/15 font-mono text-[10px] text-[#b0a8ff]">{index + 1}</span><span className="text-[#cbd0da]">{line}</span></div>)}</div>}</Card>)}
        <div className="flex justify-end"><Button onClick={() => setTab("exercise")}>コード演習へ進む<ArrowRight className="h-4 w-4" /></Button></div>
      </div>}

      {tab === "exercise" && lesson.exercises[0] && <CodeExercise
        key={`${lesson.id}-${exerciseSession}`}
        lesson={lesson}
        exercise={lesson.exercises[0]}
        initialCode={sessionCode}
        nextLessonTitle={next?.title}
        onCompleteAndContinue={(code, result) => {
          saveLessonCode({
            lessonId: lesson.id,
            code,
            output: result.output,
            compilerOutput: result.compilerOutput ?? "",
            passed: true,
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          });
          if (curriculum === "advanced") completeAdvancedLesson(lesson.id);
          else completeLesson(lesson.id);
          router.push(next ? `${basePath}/${next.id}` : basePath);
        }}
      />}

      {tab === "ai" && <div className="mx-auto h-[720px] max-w-5xl overflow-hidden rounded-2xl border border-primary/25 bg-surface"><GeminiTutorPanel compact /></div>}

      {tab === "summary" && <div className="mx-auto max-w-4xl space-y-5">
        <Card className="p-7 sm:p-9"><Sparkles className="h-8 w-8 text-[#aaa1ff]" /><h2 className="mt-4 text-2xl font-semibold">このレッスンのまとめ</h2><div className="mt-6"><BulletList items={lesson.summaryPoints} tone="success" /></div></Card>
        <Card className="p-7 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-success" /><h2 className="mt-4 text-xl font-semibold">{completed ? "レッスン完了済み" : "理解できたら完了にしましょう"}</h2><p className="mt-2 text-sm text-muted">{curriculum === "advanced" ? "コードを変更し、失敗する入力も確認してから完了にしましょう。" : "問題演習や模擬試験で忘れていたら、いつでもこの解説へ戻れます。"}</p>{!completed ? <Button className="mt-5" onClick={() => curriculum === "advanced" ? completeAdvancedLesson(lesson.id) : completeLesson(lesson.id)}>レッスンを完了する</Button> : next ? <Link href={`${basePath}/${next.id}`} className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold">次の講義「{next.title}」へ</Link> : <Link href={basePath} className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold">ロードマップへ</Link>}</Card>
      </div>}

      {reattendOpen && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-lg p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#aaa1ff]">Relearn lesson</p><h2 className="mt-2 text-xl font-semibold">この講義を再受講しますか？</h2></div><Button variant="ghost" size="icon" aria-label="閉じる" onClick={() => setReattendOpen(false)}><X className="h-4 w-4" /></Button></div>
          <p className="mt-4 text-sm leading-7 text-muted">前回のコードが保存されています。続きから確認するか、初期コードへ戻して最初から解き直すかを選べます。</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="h-auto min-h-14 px-4 py-3" onClick={() => { setSessionCode(lessonCodeRecord?.code ?? lesson.exercises[0]?.starterCode ?? ""); setExerciseSession((value) => value + 1); setTab("exercise"); setReattendOpen(false); }}><Save className="h-4 w-4 text-success" />保存コードで再開</Button>
            <Button className="h-auto min-h-14 px-4 py-3" onClick={() => { resetLessonCode(lesson.id); setSessionCode(lesson.exercises[0]?.starterCode ?? ""); setExerciseSession((value) => value + 1); setTab("exercise"); setReattendOpen(false); }}><RotateCcw className="h-4 w-4" />リセットして再受講</Button>
          </div>
        </Card>
      </div>}
    </article>
  );
}
