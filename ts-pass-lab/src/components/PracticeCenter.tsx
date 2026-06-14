'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Bot, Bookmark, Check, Filter, Heart, RefreshCw, RotateCcw, Sparkles, Target } from 'lucide-react';
import { questionCategories, questions } from '@/data/questions';
import { categoryAccuracy, dueReviewIds, weakestCategories } from '@/lib/scoring';
import type { LearningData, Question, QuestionDifficulty, QuestionType } from '@/types/platform';
import styles from './PracticeCenter.module.css';

type PracticeMode = 'practice' | 'review' | 'analytics';

export default function PracticeCenter({
  mode,
  data,
  onAnswer,
  onToggleFavorite,
  onToggleReview,
  onAskAI,
}: {
  mode: PracticeMode;
  data: LearningData;
  onAnswer: (question: Question, selected: number) => void;
  onToggleFavorite: (questionId: string) => void;
  onToggleReview: (questionId: string) => void;
  onAskAI: (context: string) => void;
}) {
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'all' | QuestionDifficulty>('all');
  const [type, setType] = useState<'all' | QuestionType>('all');
  const [source, setSource] = useState<'all' | 'wrong' | 'favorite' | 'review'>('all');
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const wrongIds = useMemo(() => {
    const latest = new Map<string, boolean>();
    data.attempts.forEach((attempt) => latest.set(attempt.questionId, attempt.correct));
    return [...latest.entries()].filter(([, correct]) => !correct).map(([id]) => id);
  }, [data.attempts]);
  const reviewIds = useMemo(() => dueReviewIds(data), [data]);

  const filtered = useMemo(() => questions.filter((question) => {
    if (category !== 'all' && question.category !== category) return false;
    if (difficulty !== 'all' && question.difficulty !== difficulty) return false;
    if (type !== 'all' && question.type !== type) return false;
    if (mode === 'review' && !reviewIds.includes(question.id)) return false;
    if (source === 'wrong' && !wrongIds.includes(question.id)) return false;
    if (source === 'favorite' && !data.favorites.includes(question.id)) return false;
    if (source === 'review' && !reviewIds.includes(question.id)) return false;
    return true;
  }), [category, data.favorites, difficulty, mode, reviewIds, source, type, wrongIds]);

  const activeQuestions = queue.length
    ? queue.map((id) => questions.find((question) => question.id === id)).filter((question): question is Question => Boolean(question))
    : filtered;
  const question = activeQuestions[index] || activeQuestions[0];

  const resetQuestion = (nextIndex = 0) => {
    setIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
  };

  const randomTest = () => {
    const shuffled = [...filtered].sort(() => Math.random() - .5).slice(0, 10);
    setQueue(shuffled.map((question) => question.id));
    resetQuestion();
  };

  if (mode === 'analytics') {
    const accuracy = categoryAccuracy(data.attempts);
    const weak = weakestCategories(data.attempts);
    const totalCorrect = data.attempts.filter((attempt) => attempt.correct).length;
    const percentage = data.attempts.length ? Math.round((totalCorrect / data.attempts.length) * 100) : 0;
    return (
      <div className={styles.page}>
        <section className={styles.hero}><div><span>LEARNING ANALYTICS</span><h1>苦手を見つけて、次の一歩を決める</h1><p>解答履歴から分野別正答率と復習タイミングを計算します。</p></div><Target size={40} /></section>
        <section className={styles.stats}><article><small>総回答数</small><strong>{data.attempts.length}</strong></article><article><small>全体正答率</small><strong>{percentage}%</strong></article><article><small>今日の復習</small><strong>{reviewIds.length}</strong></article><article><small>お気に入り</small><strong>{data.favorites.length}</strong></article></section>
        <div className={styles.analyticsGrid}>
          <section className={styles.panel}><h2><BarChart3 size={18} />分野別正答率</h2>{Object.keys(accuracy).length === 0 ? <p className={styles.empty}>問題を解くと分析が始まります。</p> : Object.entries(accuracy).sort((a,b) => a[1].percentage-b[1].percentage).map(([name,value]) => <div className={styles.accuracyRow} key={name}><div><span>{name}</span><b>{value.correct}/{value.total}</b></div><i><em style={{width:`${value.percentage}%`}} /></i><strong>{value.percentage}%</strong></div>)}</section>
          <section className={styles.panel}><h2><Sparkles size={18} />弱点とおすすめ</h2>{weak.length === 0 ? <p className={styles.empty}>まずは10問テストから始めましょう。</p> : weak.map(([name,value], position) => <article className={styles.weakCard} key={name}><span>{position+1}</span><div><h3>{name}</h3><p>正答率 {value.percentage}%・{value.total}問回答</p><small>{value.percentage < 50 ? '基礎講座を読み直し、翌日に復習しましょう。' : 'コード読解問題を3問追加で解きましょう。'}</small></div></article>)}<button onClick={() => onAskAI(`学習履歴の弱点: ${weak.map(([name,value]) => `${name} ${value.percentage}%`).join('、')}\n次の学習方法を提案してください。`)}><Bot size={15} />AIに学習戦略を相談</button></section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}><div><span>{mode === 'review' ? 'SPACED REVIEW' : `${questions.length} PRACTICE QUESTIONS`}</span><h1>{mode === 'review' ? '忘れる前に、短く復習する' : '問題演習センター'}</h1><p>{mode === 'review' ? '不正解問題と1日・3日・7日・14日周期の復習問題を表示します。' : '分野・難易度・形式を選び、コードを読んで理解を定着させます。'}</p></div><RefreshCw size={40} /></section>

      <section className={styles.filters}>
        <span><Filter size={15} />出題条件</span>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setQueue([]); resetQuestion(); }}><option value="all">すべての分野</option>{questionCategories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={difficulty} onChange={(event) => { setDifficulty(event.target.value as typeof difficulty); setQueue([]); resetQuestion(); }}><option value="all">全難易度</option><option value="basic">basic</option><option value="standard">standard</option><option value="advanced">advanced</option></select>
        <select value={type} onChange={(event) => { setType(event.target.value as typeof type); setQueue([]); resetQuestion(); }}><option value="all">全形式</option><option value="choice">4択</option><option value="output">実行結果</option><option value="reading">コード読解</option><option value="fill">穴埋め</option><option value="trueFalse">正誤</option></select>
        <select value={source} onChange={(event) => { setSource(event.target.value as typeof source); setQueue([]); resetQuestion(); }}><option value="all">すべて</option><option value="wrong">間違えた問題</option><option value="favorite">お気に入り</option><option value="review">復習対象</option></select>
        <button onClick={randomTest}>ランダム10問</button>
      </section>

      {!question ? <section className={styles.noQuestion}><Check size={32} /><h2>現在の条件に合う問題はありません</h2><p>復習対象がない場合は、通常演習で新しい問題に挑戦しましょう。</p></section> : <>
        <div className={styles.progress}><span>{index + 1} / {activeQuestions.length}</span><i><em style={{width:`${((index + (submitted ? 1 : 0))/activeQuestions.length)*100}%`}} /></i><small>{question.category}・{question.difficulty}</small></div>
        <article className={styles.questionCard}>
          <header><span>{question.type}</span><div><button className={data.favorites.includes(question.id) ? styles.marked : ''} onClick={() => onToggleFavorite(question.id)} aria-label="お気に入り"><Heart size={16} fill={data.favorites.includes(question.id) ? 'currentColor' : 'none'} /></button><button className={data.reviewList.includes(question.id) ? styles.marked : ''} onClick={() => onToggleReview(question.id)} aria-label="復習リスト"><Bookmark size={16} fill={data.reviewList.includes(question.id) ? 'currentColor' : 'none'} /></button></div></header>
          <h2>{question.question}</h2>
          {question.code && <pre>{question.code}</pre>}
          <div className={styles.choices}>{question.choices.map((choice, choiceIndex) => <button key={`${choice}-${choiceIndex}`} disabled={submitted} className={`${selected === choiceIndex ? styles.selected : ''} ${submitted && choiceIndex === question.answer ? styles.correct : ''} ${submitted && selected === choiceIndex && choiceIndex !== question.answer ? styles.wrong : ''}`} onClick={() => setSelected(choiceIndex)}><span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>)}</div>
          {!submitted ? <button className={styles.submit} disabled={selected === null} onClick={() => { if (selected === null) return; setSubmitted(true); onAnswer(question, selected); }}>回答する</button> : <section className={selected === question.answer ? styles.resultCorrect : styles.resultWrong}><h3>{selected === question.answer ? '正解です' : '不正解です'}</h3><p>{question.explanation}</p>{selected !== null && selected !== question.answer && <small>選んだ回答: {question.wrongReasons[selected]}</small>}<div><b>理解・実務ポイント</b>{question.examPoint}</div><button onClick={() => onAskAI(`問題: ${question.question}\nコード: ${question.code || 'なし'}\n正解: ${question.choices[question.answer]}\n解説: ${question.explanation}`)}><Bot size={14} />AIに追加解説を依頼</button></section>}
        </article>
        <div className={styles.actions}><button disabled={index === 0} onClick={() => resetQuestion(index - 1)}><RotateCcw size={14} />前へ</button><button disabled={!submitted || index >= activeQuestions.length - 1} onClick={() => resetQuestion(index + 1)}>次へ</button></div>
      </>}
    </div>
  );
}
