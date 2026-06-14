'use client';

import { useMemo, useState } from 'react';
import { Bot, BriefcaseBusiness, Check, ExternalLink, GitBranch, Loader2, Rocket, Save, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { getGeminiApiKey, getSelectedGeminiModel } from '@/lib/gemini-client';
import { scorePortfolio } from '@/lib/portfolio-scoring';
import type { PortfolioSubmission, ProjectChallenge } from '@/types/platform';
import styles from './PortfolioStudio.module.css';

export type PortfolioDraft = {
  project: ProjectChallenge;
  code: string;
};

export default function PortfolioStudio({
  submissions,
  draft,
  onSave,
  onDelete,
}: {
  submissions: PortfolioSubmission[];
  draft: PortfolioDraft | null;
  onSave: (submission: PortfolioSubmission) => void;
  onDelete: (submissionId: string) => void;
}) {
  const [projectId] = useState(draft?.project.id || '');
  const [title, setTitle] = useState(draft?.project.title || '');
  const [description, setDescription] = useState(draft ? `${draft.project.summary}\n\n実装したこと:\n- ${draft.project.requirements.join('\n- ')}` : '');
  const [code, setCode] = useState(draft?.code || '');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const score = useMemo(() => scorePortfolio({ code, description, repositoryUrl, demoUrl }), [code, demoUrl, description, repositoryUrl]);
  const rubric = [
    ['動作・完成度', score.functionality, 20],
    ['型安全性', score.typeSafety, 20],
    ['API・DB設計', score.backend, 15],
    ['セキュリティ', score.security, 15],
    ['テスト・異常系', score.testing, 15],
    ['説明・公開情報', score.documentation, 15],
  ] as const;

  const requestReview = async () => {
    if (!title.trim() || !code.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/portfolio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, code, repositoryUrl, demoUrl, score, apiKey: getGeminiApiKey(), model: getSelectedGeminiModel() }),
      });
      const data = await response.json() as { success: boolean; review?: string; error?: string };
      if (!response.ok || !data.success || !data.review) throw new Error(data.error || 'AIレビューを取得できませんでした。');
      setAiReview(data.review);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'AIレビューを取得できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!title.trim() || !code.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      projectId: projectId || `portfolio-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      code,
      repositoryUrl: repositoryUrl.trim(),
      demoUrl: demoUrl.trim(),
      score,
      aiReview,
      submittedAt: new Date().toISOString(),
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}><div><span>FROM BEGINNER TO PROFESSIONAL</span><h1>作品を提出し、実務レベルへ近づける。</h1><p>コードが動くだけでなく、型安全性、API・DB、セキュリティ、テスト、説明力まで採点します。GitHubと公開URLをそろえると、そのまま就職・案件応募用の実績になります。</p></div><BriefcaseBusiness size={42}/></section>
      <section className={styles.professional}>
        <article><GitBranch size={20}/><strong>GitHubへ記録</strong><p>READMEに目的、技術、起動方法、工夫、課題を書く</p></article>
        <article><Rocket size={20}/><strong>公開URLで確認</strong><p>本番の主要操作、API、DB保存、スマホ表示を確認する</p></article>
        <article><ShieldCheck size={20}/><strong>実務品質を説明</strong><p>入力検証、認可、テスト、エラー処理の理由を話せるようにする</p></article>
      </section>

      <div className={styles.workspace}>
        <section className={styles.form}>
          <header><Sparkles size={20}/><div><small>PORTFOLIO SUBMISSION</small><h2>作品を提出</h2></div></header>
          <label>作品名<input value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="例: 認証付きタスク管理API"/></label>
          <label>作品説明<textarea value={description} onChange={(event)=>setDescription(event.target.value)} placeholder="誰のどんな問題を、どの技術で解決したか。工夫した点と今後の改善も書きます。"/></label>
          <div className={styles.urls}><label>GitHub URL<input value={repositoryUrl} onChange={(event)=>setRepositoryUrl(event.target.value)} placeholder="https://github.com/..."/></label><label>公開URL<input value={demoUrl} onChange={(event)=>setDemoUrl(event.target.value)} placeholder="https://...vercel.app"/></label></div>
          <label>提出コード<textarea className={styles.code} value={code} onChange={(event)=>setCode(event.target.value)} placeholder="制作課題から提出すると自動入力されます。"/></label>
          {error&&<p className={styles.error}>{error}</p>}
          <div className={styles.actions}><button disabled={!title.trim()||!code.trim()||loading} onClick={()=>void requestReview()}>{loading?<Loader2 className={styles.spin} size={15}/>:<Bot size={15}/>}AI面接官レビュー</button><button disabled={!title.trim()||!code.trim()} onClick={save}><Save size={15}/>採点結果を保存</button></div>
        </section>

        <aside className={styles.score}>
          <span>AUTO REVIEW SCORE</span><strong>{score.total}<small>/100</small></strong><p>{score.total>=85?'実務ポートフォリオとして強い状態です':score.total>=65?'基礎は完成。公開情報とテストを補強しましょう':score.total>=40?'動作から一歩進み、設計理由を追加しましょう':'小さく動く機能を一つ完成させるところから始めましょう'}</p>
          <div>{rubric.map(([label,value,max])=><article key={label}><header><span>{label}</span><b>{value}/{max}</b></header><i><em style={{width:`${value/max*100}%`}}/></i></article>)}</div>
          {aiReview&&<section className={styles.review}><h3><Bot size={16}/>AI面接官の講評</h3><p>{aiReview}</p></section>}
        </aside>
      </div>

      <section className={styles.library}><header><div><small>MY PORTFOLIO</small><h2>保存した提出作品</h2></div><span>{submissions.length}作品</span></header>{submissions.length===0?<p className={styles.empty}>制作課題を完成させ、「ポートフォリオへ提出」から最初の作品を登録しましょう。</p>:<div>{submissions.map((item)=><article key={item.id}><header><div><span>{new Date(item.submittedAt).toLocaleDateString('ja-JP')}</span><h3>{item.title}</h3></div><strong>{item.score.total}<small>/100</small></strong></header><p>{item.description||'説明未入力'}</p><footer>{item.repositoryUrl&&<a href={item.repositoryUrl} target="_blank" rel="noreferrer"><GitBranch size={13}/>GitHub</a>}{item.demoUrl&&<a href={item.demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={13}/>公開版</a>}<button onClick={()=>onDelete(item.id)}><Trash2 size={13}/>削除</button></footer>{item.aiReview&&<details><summary><Check size={13}/>AI講評を見る</summary><p>{item.aiReview}</p></details>}</article>)}</div>}</section>
    </div>
  );
}
