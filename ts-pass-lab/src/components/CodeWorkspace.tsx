'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Copy, Eye, Focus, Lightbulb, ListOrdered, Loader2, Play, RotateCcw, Save, Terminal, Undo2, WrapText, XCircle } from 'lucide-react';
import { configureLearningTypeScript } from '@/lib/monaco-typescript';
import { saveLessonCodeRecord } from '@/lib/learning-storage';
import type { Lesson, LessonCodeRecord } from '@/types/learning';
import styles from './CodeWorkspace.module.css';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type InferredType = { name: string; type: string; line: number };
type RunResult = {
  state: 'idle' | 'success' | 'error';
  text: string;
  output: string;
  diagnostics: string[];
  inferredTypes: InferredType[];
  exitCode?: number;
};

type TypecheckResponse = {
  error?: string;
  diagnostics: string[];
  inferredTypes: InferredType[];
  javascript: string;
  typecheckPassed: boolean;
};

function runInWorker(javascript: string): Promise<{ output: string; exitCode: number; error?: string }> {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = () => {
        const logs = [];
        const format = (value) => {
          if (typeof value === "string") return value;
          try { return JSON.stringify(value); } catch { return String(value); }
        };
        const console = {
          log: (...values) => logs.push(values.map(format).join(" ")),
          error: (...values) => logs.push(values.map(format).join(" ")),
          warn: (...values) => logs.push(values.map(format).join(" "))
        };
        try {
          ${javascript}
          self.postMessage({ output: logs.join("\\n"), exitCode: 0 });
        } catch (error) {
          self.postMessage({ output: logs.join("\\n"), exitCode: 1, error: error instanceof Error ? error.message : String(error) });
        }
      };
    `;
    const url = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ output: '', exitCode: 124, error: '実行が2秒を超えました。無限ループがないか確認してください。' });
    }, 2000);
    worker.onmessage = (event: MessageEvent<{ output: string; exitCode: number; error?: string }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ output: '', exitCode: 1, error: 'JavaScript実行中にエラーが発生しました。' });
    };
    worker.postMessage(null);
  });
}

export default function CodeWorkspace({
  lesson,
  initialCode,
  nextLessonTitle,
  onAskAI,
  onFocusChange,
  onCompleteAndContinue,
}: {
  lesson: Lesson;
  initialCode?: string;
  nextLessonTitle?: string;
  onAskAI: (context: string) => void;
  onFocusChange: (focused: boolean) => void;
  onCompleteAndContinue: (record: LessonCodeRecord) => void;
}) {
  const [code, setCode] = useState(initialCode ?? lesson.exercise.starterCode);
  const [focused, setFocused] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [hint, setHint] = useState(false);
  const [guide, setGuide] = useState(false);
  const [solution, setSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult>({
    state: 'idle',
    text: '実行すると、型チェック・推論された型・実際の標準出力がここに表示されます。',
    output: '',
    diagnostics: [],
    inferredTypes: [],
  });

  useEffect(() => {
    onFocusChange(focused);
    return () => onFocusChange(false);
  }, [focused, onFocusChange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveLessonCodeRecord({
        lessonId: lesson.id,
        code,
        output: result.output,
        diagnostics: result.diagnostics,
        inferredTypes: result.inferredTypes,
        passed: result.state === 'success',
        updatedAt: new Date().toISOString(),
        completedAt: null,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [code, lesson.id, result.diagnostics, result.inferredTypes, result.output, result.state]);

  const execute = async () => {
    if (code.trim() === lesson.exercise.starterCode.trim()) {
      setResult({ state: 'error', text: 'まだ初期状態です。「書き方ガイド」を開き、STEP 1からコードを書いてみましょう。', output: '', diagnostics: [], inferredTypes: [] });
      return;
    }
    if (code.includes('TODO')) {
      setResult({ state: 'error', text: 'TODOが残っています。コメントを削除し、型や値を変更して完成させてください。', output: '', diagnostics: [], inferredTypes: [] });
      return;
    }
    setRunning(true);
    setResult({ state: 'idle', text: 'TypeScriptコンパイラで型を検査しています...', output: '', diagnostics: [], inferredTypes: [] });
    try {
      const response = await fetch('/api/typescript-run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const checked = await response.json() as TypecheckResponse;
      if (!response.ok || checked.error) throw new Error(checked.error || '型検査を実行できませんでした。');
      if (!checked.typecheckPassed) {
        setResult({
          state: 'error',
          text: 'TypeScriptの型チェックでエラーが見つかりました。最初のエラーから直しましょう。',
          output: '',
          diagnostics: checked.diagnostics,
          inferredTypes: checked.inferredTypes,
          exitCode: 2,
        });
        return;
      }

      const executed = await runInWorker(checked.javascript);
      const output = executed.output || '（console.logによる出力はありません）';
      const expected = lesson.exercise.expectedOutput.trim();
      const outputMatched = output.trim() === expected;
      const passed = executed.exitCode === 0 && outputMatched;
      const nextResult: RunResult = {
        state: passed ? 'success' : 'error',
        text: executed.error
          ? `実行時エラー: ${executed.error}`
          : outputMatched
            ? '型チェック・実行・期待出力の比較に成功しました。コードは自動保存されています。'
            : `型チェックは成功しましたが、期待値「${expected}」と実際の出力が異なります。`,
        output,
        diagnostics: [],
        inferredTypes: checked.inferredTypes,
        exitCode: executed.exitCode,
      };
      setResult(nextResult);
      saveLessonCodeRecord({
        lessonId: lesson.id,
        code,
        output,
        diagnostics: [],
        inferredTypes: checked.inferredTypes,
        passed,
        updatedAt: new Date().toISOString(),
        completedAt: passed ? new Date().toISOString() : null,
      });
    } catch (error) {
      setResult({ state: 'error', text: error instanceof Error ? error.message : 'コードを実行できませんでした。', output: '', diagnostics: [], inferredTypes: [] });
    } finally {
      setRunning(false);
    }
  };

  const context = [
    `レッスン: ${lesson.title}`,
    `演習: ${lesson.exercise.description}`,
    `要件: ${lesson.exercise.requirements.join('、')}`,
    `現在のコード:\n${code}`,
    `実行結果: ${result.text}`,
    result.output ? `標準出力:\n${result.output}` : '',
    result.inferredTypes.length ? `推論された型:\n${result.inferredTypes.map((item) => `${item.name}: ${item.type}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
  const guideSteps = lesson.exercise.guideSteps
    ?? lesson.exercise.requirements.map((item, index) => `STEP ${index + 1}: ${item}`);

  const completeAndContinue = () => {
    const record: LessonCodeRecord = {
      lessonId: lesson.id,
      code,
      output: result.output,
      diagnostics: result.diagnostics,
      inferredTypes: result.inferredTypes,
      passed: true,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    saveLessonCodeRecord(record);
    onCompleteAndContinue(record);
  };

  return (
    <section className={focused ? styles.focusOverlay : styles.workspace}>
      <div className={styles.focusInner}>
        <header className={styles.exerciseHeader}>
          <div>
            <span>CODE PRACTICE</span>
            <h2>{lesson.exercise.title}</h2>
          </div>
          <div className={styles.topActions}>
            <button onClick={() => setGuide((value) => !value)}><ListOrdered size={15} />書き方ガイド</button>
            <button onClick={() => setHint((value) => !value)}><Lightbulb size={15} />ヒント</button>
            <button onClick={() => setSolution((value) => !value)}><Eye size={15} />模範解答</button>
            <button onClick={() => onAskAI(`${context}\n\n依頼: 答えを直接書かず、次に確認する一歩だけ教えてください。`)}><Lightbulb size={15} />AIヒント</button>
            <button onClick={() => onAskAI(`${context}\n\n依頼: エラーや期待値との差を、原因候補と確認手順に分けて診断してください。`)}><Bot size={15} />AI診断</button>
            <button className={styles.primaryAction} onClick={() => setFocused((value) => !value)}>{focused ? <Undo2 size={15} /> : <Focus size={15} />}{focused ? '通常表示に戻る' : '集中モード'}</button>
          </div>
        </header>

        {focused && guide && (
          <div className={`${styles.guide} ${styles.focusGuide}`}>
            <strong><ListOrdered size={15} />コードを書く順番</strong>
            <ol>{guideSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            <small>一度に全部書かず、1ステップ書くたびに型と値を確認しましょう。</small>
          </div>
        )}

        <div className={`${styles.twoPane} ${focused ? styles.focusedPane : ''}`}>
          {!focused && (
            <article className={styles.mission}>
              <span>MISSION</span>
              <h3>{lesson.exercise.title}</h3>
              <p>{lesson.exercise.description}</p>
              <h4>実装条件</h4>
              <ul>{lesson.exercise.requirements.map((item) => <li key={item}><CheckCircle2 size={14} />{item}</li>)}</ul>
              <div className={styles.expected}><small>期待される出力</small><code>{lesson.exercise.expectedOutput}</code></div>
              <div className={styles.examPoint}><small>学習ポイント</small><p>{lesson.exercise.examPoint}</p></div>
              {guide && <div className={styles.guide}><strong><ListOrdered size={15} />コードを書く順番</strong><ol>{guideSteps.map((step) => <li key={step}>{step}</li>)}</ol><small>一度に全部書かず、1ステップ書くたびに型と値を確認しましょう。</small></div>}
              {hint && <div className={styles.hint}><strong>ヒント</strong>{lesson.exercise.hints.map((text, index) => <p key={text}>{index + 1}. {text}</p>)}</div>}
            </article>
          )}

          <div className={styles.editorShell}>
            <div className={styles.editorToolbar}>
              <span>main.ts</span>
              <button onClick={() => setWrap((value) => !value)}><WrapText size={14} />折返し{wrap ? 'ON' : 'OFF'}</button>
              <button onClick={() => navigator.clipboard.writeText(code)}><Copy size={14} />コピー</button>
              <button onClick={() => {
                setCode(lesson.exercise.starterCode);
                setResult({ state: 'idle', text: '初期コードへ戻しました。STEP 1から書いてみましょう。', output: '', diagnostics: [], inferredTypes: [] });
              }}><RotateCcw size={14} />リセット</button>
              <button className={styles.runButton} disabled={running} onClick={() => void execute()}>{running ? <Loader2 size={14} className={styles.spin} /> : <Play size={14} fill="currentColor" />}{running ? '検査中...' : '実行する'}</button>
            </div>
            <Editor
              height={focused ? '72vh' : '540px'}
              language="typescript"
              theme="vs-dark"
              value={code}
              beforeMount={configureLearningTypeScript}
              onChange={(value) => {
                setCode(value || '');
                if (result.state !== 'idle') setResult({ state: 'idle', text: 'コードを変更しました。もう一度実行して判定してください。', output: '', diagnostics: [], inferredTypes: [] });
              }}
              options={{
                fontSize: 15,
                lineHeight: 24,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: wrap ? 'on' : 'off',
                padding: { top: 18, bottom: 18 },
                renderLineHighlight: 'all',
              }}
            />
          </div>
        </div>

        <div className={styles.console}>
          <div className={styles.consoleTitle}><Terminal size={15} />実際のターミナル出力 / TypeScript診断</div>
          <div className={`${styles.consoleBody} ${styles[result.state]}`}>
            {result.state === 'success' ? <CheckCircle2 size={20} /> : result.state === 'error' ? <XCircle size={20} /> : <Terminal size={20} />}
            <div>
              <strong>{result.state === 'success' ? '課題成功' : result.state === 'error' ? '修正が必要です' : '未実行'}</strong>
              <p>{result.text}</p>
              {(result.diagnostics.length > 0 || result.output || result.exitCode !== undefined) && <div className={styles.terminalOutput}>
                <span>$ npx tsc --strict main.ts &amp;&amp; node main.js</span>
                {result.diagnostics.length > 0 && <><small>[TypeScript diagnostics]</small>{result.diagnostics.map((diagnostic) => <code key={diagnostic}>{diagnostic}</code>)}</>}
                {result.output && <><small>[stdout]</small><pre>{result.output}</pre></>}
                {result.exitCode !== undefined && <em>process exited with code {result.exitCode}</em>}
              </div>}
              {result.inferredTypes.length > 0 && <div className={styles.typeInference}><strong>コンパイラが推論した型</strong><div>{result.inferredTypes.map((item) => <span key={`${item.line}-${item.name}`}><code>{item.name}</code><b>{item.type}</b><small>line {item.line}</small></span>)}</div></div>}
              {result.state === 'success' && <div className={styles.successNext}><strong><Save size={15} />このコードは講義記録へ保存されました</strong><button onClick={completeAndContinue}>講義を完了して{nextLessonTitle ? `「${nextLessonTitle}」へ` : 'ロードマップへ'}<ArrowRight size={15} /></button></div>}
            </div>
          </div>
        </div>

        {solution && <div className={styles.solution}><h3>模範解答</h3><pre>{lesson.exercise.solution}</pre><p>型注釈と実際の値が一致していること、最終的な出力まで順番に確認してください。</p></div>}
      </div>
    </section>
  );
}
