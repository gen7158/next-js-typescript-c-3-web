"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Bot, BrainCircuit } from "lucide-react";
import { AnswerResult } from "@/components/practice/AnswerResult";
import { QuestionCard, type UserAnswer } from "@/components/practice/QuestionCard";
import { QuestionFilter } from "@/components/practice/QuestionFilter";
import { ReviewList } from "@/components/practice/ReviewList";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/data/questions";
import { useLearningStore } from "@/store/learningStore";
import { useUIStore } from "@/store/uiStore";

function PracticeContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [randomIds, setRandomIds] = useState<string[] | null>(() => searchParams.get("mode") === "random" ? [...questions].sort(() => Math.random() - 0.5).slice(0, 10).map((q) => q.id) : null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<UserAnswer>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const store = useLearningStore();
  const setAiContext = useUIStore((state) => state.setAiContext);
  const setAiDrawerOpen = useUIStore((state) => state.setAiDrawerOpen);
  const reviewOnly = searchParams.get("mode") === "review";

  const visible = useMemo(() => questions.filter((question) => {
    if (randomIds && !randomIds.includes(question.id)) return false;
    if (reviewOnly && !store.reviewQuestionIds.includes(question.id) && !store.attempts.some((attempt) => attempt.questionId === question.id && !attempt.correct)) return false;
    return (!category || question.category === category) && (!difficulty || question.difficulty === difficulty) && (!type || question.type === type);
  }), [category, difficulty, type, randomIds, reviewOnly, store.reviewQuestionIds, store.attempts]);

  const question = visible[index % Math.max(1, visible.length)];
  const wrongCount = new Set(store.attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.questionId)).size;

  useEffect(() => {
    if (!question) return;
    setAiContext({
      title: question.category,
      problem: question.question,
      code: question.code,
      error: submitted ? `回答結果: ${correct ? "正解" : "不正解"}\n解説: ${question.explanation}` : undefined,
    });
  }, [correct, question, setAiContext, submitted]);

  const resetQuestion = (nextIndex: number) => { setIndex(nextIndex); setAnswer(null); setSubmitted(false); setCorrect(false); };
  const randomize = () => { setRandomIds([...questions].sort(() => Math.random() - 0.5).slice(0, 10).map((item) => item.id)); setCategory(""); setDifficulty(""); setType(""); resetQuestion(0); };
  const submit = () => {
    if (!question || answer === null) return;
    const isCorrect = typeof question.answer === "string" ? String(answer).trim().toLowerCase() === question.answer.trim().toLowerCase() : answer === question.answer;
    setCorrect(isCorrect);
    setSubmitted(true);
    store.recordAttempt({ questionId: question.id, category: question.category, answer, correct: isCorrect, answeredAt: new Date().toISOString() });
    if (!isCorrect && !store.reviewQuestionIds.includes(question.id)) store.toggleReview(question.id);
  };

  return (
    <div className="animate-in space-y-5">
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-gradient-to-r from-cyan/10 via-surface to-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan">102 practice questions</p><h1 className="mt-2 text-2xl font-bold">問題演習</h1><p className="mt-2 text-xs leading-6 text-muted">解いた直後に詳しい理由を確認し、間違いは自動で復習リストへ追加されます。</p></div>
        <ReviewList reviewCount={store.reviewQuestionIds.length} favoriteCount={store.favoriteQuestionIds.length} wrongCount={wrongCount} />
      </section>
      <QuestionFilter category={category} difficulty={difficulty} type={type} onCategory={(value) => { setCategory(value); setRandomIds(null); resetQuestion(0); }} onDifficulty={(value) => { setDifficulty(value); resetQuestion(0); }} onType={(value) => { setType(value); resetQuestion(0); }} onRandom={randomize} />
      <div className="flex justify-end"><Button variant="secondary" size="sm" onClick={() => setAiDrawerOpen(true)}><Bot className="h-4 w-4 text-[#aaa1ff]" />この問題をAIに質問</Button></div>
      {visible.length && question ? (
        <>
          <div className="flex items-center gap-3"><span className="text-xs font-semibold">{index + 1} / {visible.length}</span><Progress value={((index + (submitted ? 1 : 0)) / visible.length) * 100} className="flex-1" /><span className="text-[10px] text-muted">{randomIds ? "ランダムテスト" : reviewOnly ? "復習モード" : "分野別演習"}</span></div>
          <QuestionCard question={question} answer={answer} submitted={submitted} favorite={store.favoriteQuestionIds.includes(question.id)} review={store.reviewQuestionIds.includes(question.id)} onAnswer={setAnswer} onSubmit={submit} onFavorite={() => store.toggleFavorite(question.id)} onReview={() => store.toggleReview(question.id)} />
          {submitted && <AnswerResult question={question} correct={correct} />}
          <div className="flex justify-between">
            <Button variant="secondary" disabled={index === 0} onClick={() => resetQuestion(index - 1)}><ArrowLeft className="h-4 w-4" />前へ</Button>
            <Button disabled={!submitted || index >= visible.length - 1} onClick={() => resetQuestion(index + 1)}>次の問題<ArrowRight className="h-4 w-4" /></Button>
          </div>
        </>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-center"><BrainCircuit className="h-9 w-9 text-muted" /><h2 className="mt-4 font-semibold">条件に合う問題がありません</h2><p className="mt-2 text-xs text-muted">フィルターを変更するか、問題を復習リストへ追加してください。</p><Button className="mt-5" variant="secondary" onClick={() => { setCategory(""); setDifficulty(""); setType(""); setRandomIds(null); }}>すべて表示</Button></div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return <Suspense fallback={<div className="p-8 text-sm text-muted">問題を読み込んでいます...</div>}><PracticeContent /></Suspense>;
}
