'use client';

import { useState } from 'react';
import { CalendarDays, Check, Clock3, Loader2, Sparkles, Target, Trash2 } from 'lucide-react';
import { getGeminiApiKey, getSelectedGeminiModel } from '@/lib/gemini-client';
import type { StudyPlan } from '@/types/platform';
import styles from './StudyPlanner.module.css';

export default function StudyPlanner({
  plans,
  weaknesses,
  onSave,
  onToggleDay,
  onDelete,
}: {
  plans: StudyPlan[];
  weaknesses: string[];
  onSave: (plan: StudyPlan) => void;
  onToggleDay: (planId: string, day: number) => void;
  onDelete: (planId: string) => void;
}) {
  const [goal, setGoal] = useState('React・Next.js・API・DB・認証を使ったWebアプリを自力で公開できるようになる');
  const [targetDate, setTargetDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0,10));
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, targetDate, dailyMinutes, weaknesses, apiKey: getGeminiApiKey(), model: getSelectedGeminiModel() }),
      });
      const data = await response.json() as { success: boolean; days?: StudyPlan['days']; error?: string };
      if (!response.ok || !data.success || !data.days) throw new Error(data.error || '計画を生成できませんでした。');
      onSave({ id: crypto.randomUUID(), goal, targetDate, dailyMinutes, createdAt: new Date().toISOString(), days: data.days });
    } catch (value) {
      setError(value instanceof Error ? value.message : '学習計画を生成できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}><div><span>AI STUDY PLANNER</span><h1>期限と弱点から、毎日の学習を決める</h1><p>TypeScript基礎からフロントエンド、API、DB、認証、テスト、公開までを組み合わせます。</p></div><CalendarDays size={42} /></section>
      <section className={styles.builder}>
        <div><label>学習目標<textarea value={goal} onChange={(event) => setGoal(event.target.value)} /></label><div><label>目標日<input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label><label>1日の時間<select value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))}><option value={20}>20分</option><option value={30}>30分</option><option value={45}>45分</option><option value={60}>60分</option><option value={90}>90分</option></select></label></div>{weaknesses.length > 0 && <aside><Target size={15} />苦手分野を優先: {weaknesses.join('、')}</aside>}{error && <p>{error}</p>}<button disabled={loading || goal.trim().length < 3} onClick={() => void generate()}>{loading ? <Loader2 className={styles.spin} size={16} /> : <Sparkles size={16} />}{loading ? '計画を作成中...' : 'AI学習計画を作成'}</button></div>
        <article><Clock3 size={25} /><h2>自動調整の考え方</h2><ul><li>不正解が多い分野を前半へ配置</li><li>4日ごとに復習日を設定</li><li>画面・API・DBを小さく接続</li><li>終盤に総合制作、テスト、公開</li></ul></article>
      </section>
      <section className={styles.plans}><header><div><small>MY STUDY PLANS</small><h2>保存した学習計画</h2></div><span>{plans.length}件</span></header>{plans.length === 0 ? <div className={styles.empty}>まだ計画はありません。目標日を決めて作成しましょう。</div> : plans.map((plan) => { const completed=plan.days.filter((day)=>day.completed).length; return <article className={styles.plan} key={plan.id}><header><div><h3>{plan.goal}</h3><p>{new Date(plan.createdAt).toLocaleDateString('ja-JP')}作成・目標 {plan.targetDate}</p></div><strong>{completed}/{plan.days.length}日</strong><button onClick={()=>onDelete(plan.id)}><Trash2 size={15}/></button></header><div className={styles.planProgress}><i style={{width:`${Math.round(completed/plan.days.length*100)}%`}} /></div><section>{plan.days.map((day)=><button key={day.day} className={day.completed?styles.done:''} onClick={()=>onToggleDay(plan.id,day.day)}><span>{day.completed?<Check size={14}/>:day.day}</span><div><strong>Day {day.day}: {day.title}</strong><small>{day.tasks.join('・')}</small></div><em>{day.minutes}分</em></button>)}</section></article>; })}</section>
    </div>
  );
}
