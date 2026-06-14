'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, ClipboardCheck, Clock3, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { questions } from '@/data/questions';
import { buildExamQuestions } from '@/lib/scoring';
import type { ExamResult, LearningData, Question } from '@/types/platform';
import styles from './ExamCenter.module.css';

const EXAM_SECONDS = 30 * 60;

export default function ExamCenter({
  data,
  onComplete,
  onAddReviews,
  onAskAI,
}: {
  data: LearningData;
  onComplete: (result: ExamResult) => void;
  onAddReviews: (questionIds: string[]) => void;
  onAskAI: (context: string) => void;
}) {
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(EXAM_SECONDS);
  const [result, setResult] = useState<ExamResult | null>(null);

  const running = examQuestions.length > 0 && !result;

  const finish = () => {
    if (!examQuestions.length) return;
    let score = 0;
    const categoryScores: ExamResult['categoryScores'] = {};
    const wrongQuestionIds: string[] = [];
    examQuestions.forEach((question) => {
      const correct = answers[question.id] === question.answer;
      if (correct) score += 1;
      else wrongQuestionIds.push(question.id);
      const category = categoryScores[question.category] || { correct: 0, total: 0 };
      category.total += 1;
      if (correct) category.correct += 1;
      categoryScores[question.category] = category;
    });
    const percentage = Math.round((score / examQuestions.length) * 100);
    const next: ExamResult = {
      id: crypto.randomUUID(),
      score,
      total: examQuestions.length,
      percentage,
      passed: percentage >= 70,
      categoryScores,
      wrongQuestionIds,
      completedAt: new Date().toISOString(),
    };
    setResult(next);
    onComplete(next);
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(finish, 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  // Restarting the timer for every selected answer would extend the exam.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const latest = data.examHistory[0];
  const question = examQuestions[current];
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  const sortedCategories = useMemo(() => result ? Object.entries(result.categoryScores).sort((a,b) => (a[1].correct/a[1].total)-(b[1].correct/b[1].total)) : [], [result]);

  if (!examQuestions.length) {
    return (
      <div className={styles.page}>
        <section className={styles.intro}><ClipboardCheck size={44} /><span>FULLSTACK MOCK EXAM</span><h1>TypeScript・Webフルスタック模擬試験</h1><p>{questions.length}問の問題集から分野が偏らないよう20問を選びます。試験中は解説を表示せず、終了後に分野別成績と復習対象を作成します。</p><div><em><Clock3 size={18} />制限時間30分</em><em><Target size={18} />合格ライン70%</em><em><Trophy size={18} />全20問</em></div>{latest && <aside>前回: {latest.percentage}%・{latest.passed ? '合格' : '再挑戦'}（{new Date(latest.completedAt).toLocaleDateString('ja-JP')}）</aside>}<button onClick={() => { setExamQuestions(buildExamQuestions(questions, 20)); setAnswers({}); setCurrent(0); setSeconds(EXAM_SECONDS); setResult(null); }}>模擬試験を開始する</button></section>
        {data.examHistory.length > 0 && <section className={styles.history}><h2>受験履歴</h2>{data.examHistory.slice(0,8).map((item) => <div key={item.id}><span>{new Date(item.completedAt).toLocaleString('ja-JP')}</span><strong>{item.percentage}%</strong><em className={item.passed ? styles.pass : styles.fail}>{item.passed ? '合格' : '不合格'}</em></div>)}</section>}
      </div>
    );
  }

  if (result) {
    const strongest = [...sortedCategories].reverse()[0];
    const weakest = sortedCategories[0];
    return (
      <div className={styles.page}>
        <section className={result.passed ? styles.passResult : styles.failResult}>{result.passed ? <CheckCircle2 size={48} /> : <XCircle size={48} />}<span>{result.passed ? 'PASSED' : 'KEEP LEARNING'}</span><h1>{result.percentage}%</h1><p>{result.score} / {result.total}問正解</p><strong>{result.passed ? '合格ラインを超えました' : '合格まであと少しです'}</strong></section>
        <div className={styles.resultGrid}><section><h2>分野別成績</h2>{sortedCategories.map(([name,value]) => { const percentage = Math.round(value.correct/value.total*100); return <div className={styles.category} key={name}><span>{name}</span><i><em style={{width:`${percentage}%`}} /></i><b>{percentage}%</b></div>; })}</section><section><h2>次の学習</h2><article><small>得意分野</small><strong>{strongest?.[0] || 'データなし'}</strong></article><article><small>苦手分野</small><strong>{weakest?.[0] || 'データなし'}</strong></article><article><small>復習問題</small><strong>{result.wrongQuestionIds.length}問</strong></article><button onClick={() => onAddReviews(result.wrongQuestionIds)}>間違いを復習リストへ追加</button><button onClick={() => onAskAI(`模擬試験結果: ${result.percentage}%\n分野別: ${sortedCategories.map(([name,value]) => `${name} ${value.correct}/${value.total}`).join('、')}\n弱点分析と1週間の改善案をください。`)}><Bot size={15} />AIによる弱点分析</button></section></div>
        <div className={styles.retry}><button onClick={() => { setExamQuestions([]); setResult(null); }}><RotateCcw size={15} />結果を閉じる</button><button onClick={() => { setExamQuestions(buildExamQuestions(questions,20)); setAnswers({}); setCurrent(0); setSeconds(EXAM_SECONDS); setResult(null); }}>再受験する</button></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.examHeader}><div><span>QUESTION {current+1} / {examQuestions.length}</span><strong>{question.category}</strong></div><time className={seconds < 300 ? styles.danger : ''}><Clock3 size={17} />{minutes}:{remainingSeconds}</time><button onClick={finish}>試験を終了</button></header>
      <div className={styles.examProgress}><i style={{width:`${((current+1)/examQuestions.length)*100}%`}} /></div>
      <article className={styles.question}><span>{question.difficulty}・{question.type}</span><h2>{question.question}</h2>{question.code && <pre>{question.code}</pre>}<div>{question.choices.map((choice,index) => <button key={`${choice}-${index}`} className={answers[question.id] === index ? styles.selected : ''} onClick={() => setAnswers((currentAnswers) => ({...currentAnswers,[question.id]:index}))}><b>{String.fromCharCode(65+index)}</b>{choice}</button>)}</div></article>
      <footer className={styles.examFooter}><button disabled={current===0} onClick={() => setCurrent((value) => value-1)}>前の問題</button><div>{examQuestions.map((item,index) => <button key={item.id} className={`${index===current?styles.current:''} ${answers[item.id]!==undefined?styles.answered:''}`} onClick={() => setCurrent(index)}>{index+1}</button>)}</div>{current < examQuestions.length-1 ? <button onClick={() => setCurrent((value) => value+1)}>次の問題</button> : <button onClick={finish}>採点する</button>}</footer>
    </div>
  );
}
