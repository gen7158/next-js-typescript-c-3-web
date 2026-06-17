"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, Copy, Eye, FileCode2, Focus, Lightbulb, ListOrdered, Loader2, Play, RefreshCcw, RotateCcw, Save, Terminal, Undo2, WrapText, XCircle } from "lucide-react";
import type { Exercise, Lesson } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { AiExplanationModal } from "@/components/gemini/AiExplanationModal";
import { GeminiTutorPanel } from "@/components/gemini/GeminiTutorPanel";
import { useLearningStore } from "@/store/learningStore";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type RunResult = {
  status: "idle" | "success" | "error";
  output: string;
  detail: string;
  command?: string;
  compilerOutput?: string;
  stderr?: string;
  exitCode?: number;
};

type RunResponse = {
  error?: string;
  command: string;
  compilerOutput: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  compiled: boolean;
  outputMatched: boolean;
  passed: boolean;
};

export function CodeExercise({
  lesson,
  exercise,
  initialCode,
  nextLessonTitle,
  onCompleteAndContinue,
}: {
  lesson: Lesson;
  exercise: Exercise;
  initialCode?: string;
  nextLessonTitle?: string;
  onCompleteAndContinue: (code: string, result: RunResult) => void;
}) {
  const [code, setCode] = useState(initialCode ?? exercise.starterCode);
  const [result, setResult] = useState<RunResult>({ status: "idle", output: "", detail: "実行すると、実際のコンパイル結果と標準出力がここに表示されます。" });
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState("");
  const [bottomAi, setBottomAi] = useState(false);
  const focusMode = useUIStore((state) => state.focusMode);
  const setFocusMode = useUIStore((state) => state.setFocusMode);
  const setAiContext = useUIStore((state) => state.setAiContext);
  const setAiMode = useUIStore((state) => state.setAiMode);
  const saveLessonCode = useLearningStore((state) => state.saveLessonCode);

  useEffect(() => {
    setCode(initialCode ?? exercise.starterCode);
    setResult({ status: "idle", output: "", detail: "実行すると、実際のコンパイル結果と標準出力がここに表示されます。" });
  }, [exercise.id, exercise.starterCode, initialCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveLessonCode({
        lessonId: lesson.id,
        code,
        output: result.output,
        compilerOutput: result.compilerOutput ?? "",
        passed: result.status === "success",
        updatedAt: new Date().toISOString(),
        completedAt: null,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [code, lesson.id, result.compilerOutput, result.output, result.status, saveLessonCode]);

  const context = useMemo(() => ({
    title: exercise.title,
    lesson: `${lesson.title}\n${lesson.summary}\n試験ポイント: ${lesson.examPoints.join("、")}`,
    problem: [
      exercise.description,
      exercise.taskGoal ? `作るもの: ${exercise.taskGoal}` : "",
      exercise.inputSpec ? `使う値・入力: ${exercise.inputSpec}` : "",
      exercise.outputSpec ? `出力の意味: ${exercise.outputSpec}` : "",
      `条件: ${exercise.requirements.join("、")}`,
    ].filter(Boolean).join("\n"),
    code,
    error: result.status === "idle" ? undefined : `${result.detail}\n出力: ${result.output}`,
  }), [code, exercise, lesson, result]);

  useEffect(() => {
    setAiContext(context);
  }, [context, setAiContext]);

  useEffect(() => () => setFocusMode(false), [setFocusMode]);

  const execute = async () => {
    if (code.trim() === exercise.starterCode.trim()) {
      setResult({ status: "error", output: "", detail: "まだ初期状態です。「書き方ガイド」を開き、STEP 1からコードを書いてみましょう。" });
      return;
    }
    setRunning(true);
    setResult({ status: "idle", output: "", detail: "gccでコンパイルし、プログラムを実行しています..." });
    try {
      const response = await fetch("/api/c-run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, stdin: exercise.stdin ?? "", expectedOutput: exercise.expectedOutput ?? "" }),
      });
      const value = await response.json() as RunResponse;
      if (!response.ok || value.error) throw new Error(value.error || "Cコードを実行できませんでした。");
      const detail = !value.compiled
        ? "コンパイルに失敗しました。下のgccメッセージから最初のエラーを直しましょう。"
        : value.outputMatched
          ? "コンパイル・実行・期待出力の比較にすべて成功しました。コードは自動保存されています。"
          : `実行はできましたが、期待される出力「${exercise.expectedOutput ?? ""}」と異なります。空白や改行も確認してください。`;
      const nextResult: RunResult = {
        status: value.passed ? "success" : "error",
        output: value.stdout,
        detail,
        command: value.command,
        compilerOutput: value.compilerOutput,
        stderr: value.stderr,
        exitCode: value.exitCode,
      };
      setResult(nextResult);
      saveLessonCode({
        lessonId: lesson.id,
        code,
        output: value.stdout,
        compilerOutput: value.compilerOutput,
        passed: value.passed,
        updatedAt: new Date().toISOString(),
        completedAt: value.passed ? new Date().toISOString() : null,
      });
    } catch (error) {
      setResult({ status: "error", output: "", detail: error instanceof Error ? error.message : "Cコードを実行できませんでした。" });
    } finally {
      setRunning(false);
    }
  };
  const guideSteps = exercise.guideSteps
    ?? exercise.requirements.map((item, index) => `STEP ${index + 1}: ${item}`);
  const taskGoal = exercise.taskGoal
    ?? `この演習では「${exercise.description}」を満たすCプログラムを書きます。`;
  const inputSpec = exercise.inputSpec
    ?? (exercise.stdin ? `標準入力として「${exercise.stdin.replace(/\n/g, "\\n")}」を使います。` : "外部入力は使いません。必要な値はmain関数の中で用意します。");
  const outputSpec = exercise.outputSpec
    ?? (exercise.expectedOutput ? `標準出力に「${exercise.expectedOutput}」を表示します。` : "画面への出力は必須ではありません。コンパイルと正常終了を確認します。");
  const successCriteria = exercise.successCriteria?.length
    ? exercise.successCriteria
    : [
        "課題説明にある処理をCコードで表現できている",
        "コンパイルエラーがない",
        exercise.expectedOutput ? `実行結果が「${exercise.expectedOutput}」と一致する` : "main関数が正常終了する",
      ];
  const guidePanel = (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-[#c2bcff]"><ListOrdered className="h-4 w-4" />コードを書く順番</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-6 text-[#cbd0da]">
        {guideSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
      </ol>
      <p className="mt-3 text-[11px] leading-5 text-muted">一度に全部書かず、1ステップ書くたびに変数の値と処理の順番を確認しましょう。</p>
    </div>
  );

  const openReview = (kind: "review" | "error" | "exam") => {
    setAiContext(context);
    setAiMode(kind === "exam" ? "exam" : kind === "error" ? "debug" : "review");
    const prompts = {
      review: "現在のコードをレビューし、良い点、直す点、1行ずつの処理を初心者向けに説明してください。",
      error: "現在の実行結果またはエラーの原因と、直す手順を具体的に説明してください。",
      exam: "この演習がC言語3級でどのように出題されるか、実行結果予測の注意点を説明してください。",
    };
    setReviewPrompt(prompts[kind]);
    setAiModal(true);
  };

  return (
    <div className={cn(focusMode && "fixed inset-0 z-[100] overflow-y-auto bg-[#07090d] p-3 sm:p-5")}>
      <div className={cn("mx-auto w-full", focusMode ? "max-w-none" : "max-w-[1500px]")}>
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
          <div className="mr-auto min-w-0"><div className="flex items-center gap-2"><Badge>コード演習</Badge><Badge className="border-warning/20 bg-warning/10 text-warning">重要度 高</Badge></div><h2 className="mt-2 truncate text-sm font-semibold sm:text-base">{exercise.title}</h2></div>
          <Button variant="secondary" size="sm" onClick={() => setShowGuide(!showGuide)}><ListOrdered className="h-4 w-4 text-[#aaa1ff]" />書き方ガイド</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowHint(!showHint)}><Lightbulb className="h-4 w-4 text-warning" />ヒント</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowSolution(!showSolution)}><Eye className="h-4 w-4" />模範解答</Button>
          <Button variant="secondary" size="sm" onClick={() => openReview("review")}><Bot className="h-4 w-4 text-[#aaa1ff]" />AIレビュー</Button>
          <Button size="sm" onClick={() => setFocusMode(!focusMode)}>{focusMode ? <Undo2 className="h-4 w-4" /> : <Focus className="h-4 w-4" />}{focusMode ? "通常表示に戻る" : "集中モード"}</Button>
        </div>

        {focusMode && showGuide && <div className="mb-4">{guidePanel}</div>}

        <div className={cn("grid gap-4", !focusMode && "xl:grid-cols-[minmax(300px,38%)_minmax(0,62%)]")}>
          <Card className={cn("p-5", focusMode && "hidden")}>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#aaa1ff]">Mission</p>
            <h3 className="mt-2 text-lg font-semibold">{exercise.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#cbd0da]">{exercise.description}</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#c2bcff]">作るもの</p>
                <p className="mt-2 text-xs leading-6 text-[#d6d9e2]">{taskGoal}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#c2bcff]">使う値・入力</p>
                <p className="mt-2 text-xs leading-6 text-[#d6d9e2]">{inputSpec}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#c2bcff]">出力の意味</p>
                <p className="mt-2 text-xs leading-6 text-[#d6d9e2]">{outputSpec}</p>
              </div>
            </div>
            <h4 className="mt-5 text-xs font-semibold">完成判定</h4>
            <ul className="mt-2 space-y-2">{successCriteria.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{item}</li>)}</ul>
            <h4 className="mt-5 text-xs font-semibold">実装条件</h4>
            <ul className="mt-2 space-y-2">{exercise.requirements.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{item}</li>)}</ul>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-lg bg-background p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">期待される出力</p><pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-cyan">{exercise.expectedOutput || "画面への出力なし"}</pre>{exercise.stdin && <><p className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-muted">テスト入力</p><pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-warning">{exercise.stdin}</pre></>}</div>
              <div className="rounded-lg border border-cyan/15 bg-cyan/5 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-cyan">3級でのポイント</p><p className="mt-2 text-xs leading-6 text-[#cbd0da]">{exercise.examPoint}</p></div>
            </div>
            {showGuide && <div className="mt-4">{guidePanel}</div>}
            {showHint && <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-4"><p className="text-xs font-semibold text-warning">ヒント</p><ol className="mt-2 space-y-2 text-xs leading-6 text-[#ddd3b8]">{exercise.hints.map((hint, index) => <li key={hint}>{index + 1}. {hint}</li>)}</ol></div>}
          </Card>

          <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-[#080a0f]">
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-[#0d1017] px-3 py-2">
              <span className="mr-auto flex items-center gap-2 text-xs font-semibold text-muted"><FileCode2 className="h-4 w-4 text-cyan" />main.c</span>
              <Button variant="ghost" size="sm" onClick={() => setWrap(!wrap)}><WrapText className="h-3.5 w-3.5" />{wrap ? "折返しON" : "折返しOFF"}</Button>
              <Button variant="ghost" size="sm" onClick={() => void navigator.clipboard.writeText(code)}><Copy className="h-3.5 w-3.5" />コピー</Button>
              <Button variant="ghost" size="sm" onClick={() => { setCode(exercise.starterCode); setResult({ status: "idle", output: "", detail: "初期コードへ戻しました。" }); }}><RotateCcw className="h-3.5 w-3.5" />リセット</Button>
              <Button size="sm" disabled={running} onClick={() => void execute()}>{running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}{running ? "実行中..." : "実行する"}</Button>
            </div>
            <Editor
              height={focusMode ? "72vh" : "520px"}
              language="c"
              theme="vs-dark"
              value={code}
              onChange={(value) => {
                setCode(value ?? "");
                if (result.status !== "idle") setResult({ status: "idle", output: "", detail: "コードを変更しました。もう一度実行して判定してください。" });
              }}
              options={{
                fontSize: 15,
                lineHeight: 24,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: wrap ? "on" : "off",
                padding: { top: 18, bottom: 18 },
                fontFamily: "'SFMono-Regular', Consolas, monospace",
                renderLineHighlight: "all",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-[#090c12]">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3"><Terminal className="h-4 w-4 text-muted" /><span className="text-xs font-semibold">実際のターミナル出力 / 課題判定</span><span className="ml-auto text-[10px] text-muted">gcc C17 sandbox</span></div>
          <div className="p-5">
            <div className={cn("flex items-start gap-3", result.status === "success" ? "text-success" : result.status === "error" ? "text-danger" : "text-muted")}>{result.status === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : result.status === "error" ? <XCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <RefreshCcw className="mt-0.5 h-5 w-5 shrink-0" />}<div className="min-w-0 flex-1"><p className="text-sm font-semibold">{result.status === "success" ? "課題成功" : result.status === "error" ? "修正が必要です" : "まだ実行されていません"}</p><p className="mt-2 text-xs leading-6 text-[#cbd0da]">{result.detail}</p>
              {result.command && <div className="mt-4 overflow-x-auto rounded-lg bg-black/60 p-4 font-mono text-xs leading-6 text-[#d7dce7]"><p className="text-success">$ {result.command}</p>{result.compilerOutput && <><p className="mt-3 text-warning">[compiler]</p><pre className="whitespace-pre-wrap">{result.compilerOutput}</pre></>}<p className="mt-3 text-cyan">[stdout]</p><pre className="whitespace-pre-wrap text-white">{result.output || "（出力なし）"}</pre>{result.stderr && <><p className="mt-3 text-danger">[stderr]</p><pre className="whitespace-pre-wrap">{result.stderr}</pre></>}<p className="mt-3 text-muted">process exited with code {result.exitCode}</p></div>}
              {result.status === "success" && <div className="mt-4 rounded-xl border border-success/25 bg-success/5 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-success"><Save className="h-4 w-4" />このコードは講義記録へ保存されました</p><Button className="mt-3" onClick={() => onCompleteAndContinue(code, result)}>講義を完了して{nextLessonTitle ? `「${nextLessonTitle}」へ` : "ロードマップへ"}<ArrowRight className="h-4 w-4" /></Button></div>}
            </div></div>
            {result.status === "error" && <Button variant="secondary" size="sm" className="mt-4" onClick={() => openReview("error")}><Bot className="h-4 w-4" />エラー原因をAIに聞く</Button>}
          </div>
        </div>

        {showSolution && <Card className="mt-4 p-5"><h3 className="font-semibold">模範解答</h3><div className="mt-3 overflow-x-auto rounded-lg bg-[#080a0f] p-4"><pre className="font-mono text-sm leading-6 text-[#d7dce7]">{exercise.solution}</pre></div><p className="mt-4 text-sm leading-7 text-muted">{exercise.explanation}</p></Card>}
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setShowExplanation(!showExplanation)}><Eye className="h-4 w-4" />解説を開く</Button><Button variant="secondary" onClick={() => { setBottomAi(!bottomAi); setAiContext(context); }}><Bot className="h-4 w-4 text-[#aaa1ff]" />下部AIパネル</Button><Button variant="secondary" onClick={() => openReview("exam")}><FileCode2 className="h-4 w-4" />試験での出方を聞く</Button></div>
        {showExplanation && <Card className="mt-4 p-5"><h3 className="font-semibold">詳細解説</h3><p className="mt-3 text-sm leading-7 text-[#cbd0da]">{exercise.explanation}</p><p className="mt-3 text-sm leading-7 text-cyan">{exercise.examPoint}</p></Card>}
        {bottomAi && <div className="mt-4 h-[620px] overflow-hidden rounded-xl border border-primary/25 bg-surface"><GeminiTutorPanel compact /></div>}
      </div>
      <AiExplanationModal open={aiModal} onOpenChange={setAiModal} initialPrompt={reviewPrompt} />
    </div>
  );
}
