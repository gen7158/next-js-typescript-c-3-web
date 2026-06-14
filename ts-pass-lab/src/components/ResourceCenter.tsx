'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppWindow, Award, BookOpen, Check, Cloud, Download, GitBranch, Loader2, Search, ShieldAlert, Upload } from 'lucide-react';
import { glossary } from '@/data/glossary';
import { downloadJson } from '@/lib/learning-storage';
import { GEMINI_STORAGE } from '@/lib/gemini-client';
import type { Lesson, LessonCodeRecord } from '@/types/learning';
import type { LearningData } from '@/types/platform';
import styles from './ResourceCenter.module.css';

type BackupData = {
  version: 2;
  exportedAt: string;
  learningData: LearningData;
  customLessons: Lesson[];
  progress: { completed: string[]; studyDates: string[] };
  selectedModel: string;
  lessonCodeRecords?: Record<string, LessonCodeRecord>;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function ResourceCenter({
  data,
  customLessons,
  completed,
  studyDates,
  lessonCodeRecords,
  onRestore,
}: {
  data: LearningData;
  customLessons: Lesson[];
  completed: string[];
  studyDates: string[];
  lessonCodeRecords: Record<string, LessonCodeRecord>;
  onRestore: (backup: BackupData) => void;
}) {
  const [tab, setTab] = useState<'glossary'|'achievements'|'data'>('glossary');
  const [query, setQuery] = useState('');
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent|null>(null);
  const [online, setOnline] = useState(true);
  const [githubToken, setGithubToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOnline(navigator.onLine);
      setGithubToken(localStorage.getItem('ts-pass-lab-github-token') || '');
      setGistId(localStorage.getItem('ts-pass-lab-gist-id') || '');
    }, 0);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onInstall);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onInstall);
    };
  }, []);

  const backup = (): BackupData => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    learningData: data,
    customLessons,
    progress: { completed, studyDates },
    selectedModel: localStorage.getItem(GEMINI_STORAGE.selectedModel) || '',
    lessonCodeRecords,
  });

  const filteredTerms = glossary.filter((item) => `${item.term}${item.reading}${item.category}${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const correct = data.attempts.filter((attempt)=>attempt.correct).length;
  const accuracy = data.attempts.length ? Math.round(correct/data.attempts.length*100) : 0;
  const achievements = useMemo(() => [
    { title:'最初の一歩', description:'講座を1つ完了', unlocked:completed.length>=1 },
    { title:'学習習慣', description:'3日以上学習', unlocked:studyDates.length>=3 },
    { title:'問題ハンター', description:'問題へ25回答', unlocked:data.attempts.length>=25 },
    { title:'正確な型付け', description:'全体正答率80%以上（10問以上）', unlocked:data.attempts.length>=10&&accuracy>=80 },
    { title:'模試合格', description:'模擬試験で70%以上', unlocked:data.examHistory.some((item)=>item.passed) },
    { title:'AI教材編集者', description:'AI講座を3つ保存', unlocked:customLessons.length>=3 },
    { title:'プロジェクトビルダー', description:'制作課題の全ステップを1つ完了', unlocked:data.projectProgress.some((item)=>item.completedSteps.length>=3) },
    { title:'復習マスター', description:'累計50回答', unlocked:data.attempts.length>=50 },
    { title:'フルスタック学習者', description:'標準講座を30個完了', unlocked:completed.length>=30 },
    { title:'リリース準備完了', description:'標準講座をすべて完了', unlocked:completed.length>=63 },
    { title:'ポートフォリオ公開', description:'提出作品を1つ保存', unlocked:data.portfolioSubmissions.length>=1 },
  ], [accuracy, completed.length, customLessons.length, data.attempts.length, data.examHistory, data.portfolioSubmissions.length, data.projectProgress, studyDates.length]);

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as BackupData;
      if (parsed.version !== 2 || !parsed.learningData || !Array.isArray(parsed.customLessons)) throw new Error('対応していないバックアップ形式です。');
      onRestore(parsed);
      setMessage('バックアップを復元しました。');
      setError('');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'バックアップを読み込めませんでした。');
    }
  };

  const saveToGist = async () => {
    if (!githubToken.trim()) return;
    setSyncing(true); setMessage(''); setError('');
    try {
      const body = { description:'TS PASS LAB learning backup', public:false, files:{'ts-pass-lab-backup.json':{content:JSON.stringify(backup(),null,2)}} };
      const response = await fetch(gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists', {
        method:gistId?'PATCH':'POST',
        headers:{Authorization:`Bearer ${githubToken.trim()}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},
        body:JSON.stringify(body),
      });
      const value = await response.json() as {id?:string;message?:string};
      if(!response.ok||!value.id) throw new Error(value.message||'Gistへ保存できませんでした。');
      setGistId(value.id);
      localStorage.setItem('ts-pass-lab-github-token',githubToken.trim());
      localStorage.setItem('ts-pass-lab-gist-id',value.id);
      setMessage('非公開GitHub Gistへ同期しました。');
    } catch(value) { setError(value instanceof Error?value.message:'クラウド同期に失敗しました。'); }
    finally { setSyncing(false); }
  };

  const loadFromGist = async () => {
    if(!githubToken.trim()||!gistId.trim()) return;
    setSyncing(true); setMessage(''); setError('');
    try {
      const response=await fetch(`https://api.github.com/gists/${gistId.trim()}`,{headers:{Authorization:`Bearer ${githubToken.trim()}`,'X-GitHub-Api-Version':'2022-11-28'}});
      const value=await response.json() as {files?:Record<string,{content?:string}>;message?:string};
      const content=value.files?.['ts-pass-lab-backup.json']?.content;
      if(!response.ok||!content) throw new Error(value.message||'Gistバックアップが見つかりません。');
      onRestore(JSON.parse(content) as BackupData);
      setMessage('GitHub Gistから学習データを復元しました。');
    } catch(value) { setError(value instanceof Error?value.message:'クラウドから復元できませんでした。'); }
    finally { setSyncing(false); }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}><div><span>LEARNING RESOURCES</span><h1>辞典・実績・データ管理</h1><p>調べる、達成を確認する、端末間で学習データを移す機能をまとめています。</p></div><BookOpen size={42}/></section>
      <nav className={styles.tabs}><button className={tab==='glossary'?styles.active:''} onClick={()=>setTab('glossary')}><BookOpen size={15}/>用語辞典</button><button className={tab==='achievements'?styles.active:''} onClick={()=>setTab('achievements')}><Award size={15}/>実績・バッジ</button><button className={tab==='data'?styles.active:''} onClick={()=>setTab('data')}><Cloud size={15}/>バックアップ・PWA</button></nav>
      {tab==='glossary'&&<><div className={styles.search}><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="用語・読み・説明を検索"/></div><section className={styles.glossary}>{filteredTerms.map((item)=><article key={item.term}><header><div><h2>{item.term}</h2><span>{item.reading}</span></div><em>{item.category}</em></header><p>{item.description}</p><pre>{item.example}</pre></article>)}</section></>}
      {tab==='achievements'&&<><section className={styles.achievementSummary}><Award size={30}/><div><strong>{achievements.filter((item)=>item.unlocked).length} / {achievements.length}</strong><span>解除済みバッジ</span></div><i><em style={{width:`${achievements.filter((item)=>item.unlocked).length/achievements.length*100}%`}}/></i></section><section className={styles.achievements}>{achievements.map((item,index)=><article className={item.unlocked?styles.unlocked:''} key={item.title}><span>{item.unlocked?<Check size={20}/>:index+1}</span><h2>{item.title}</h2><p>{item.description}</p><em>{item.unlocked?'解除済み':'未解除'}</em></article>)}</section></>}
      {tab==='data'&&<div className={styles.dataGrid}>
        <section><Download size={24}/><h2>ローカルバックアップ</h2><p>APIキーを除く、学習履歴・講座・計画・制作課題をJSONへ保存します。</p><div><button onClick={()=>downloadJson(`ts-pass-lab-${new Date().toISOString().slice(0,10)}.json`,backup())}><Download size={14}/>書き出す</button><label><Upload size={14}/>読み込む<input type="file" accept="application/json" onChange={(event)=>{const file=event.target.files?.[0];if(file)void importBackup(file)}}/></label></div></section>
        <section><AppWindow size={24}/><h2>PWA・オフライン</h2><p>現在: <strong>{online?'オンライン':'オフライン'}</strong>。インストール後は教材の基本画面をアプリとして起動できます。</p><button disabled={!installPrompt} onClick={async()=>{if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null)}}><AppWindow size={14}/>{installPrompt?'この端末へインストール':'ブラウザのインストールメニューを利用'}</button></section>
        <section className={styles.github}><GitBranch size={24}/><h2>GitHub Gistクラウド同期</h2><p>個人アクセストークンのGist権限を使い、非公開Gistへバックアップします。</p><input type="password" value={githubToken} onChange={(event)=>setGithubToken(event.target.value)} placeholder="GitHub token（gist権限）"/><input value={gistId} onChange={(event)=>setGistId(event.target.value)} placeholder="Gist ID（初回保存後に自動設定）"/><div><button disabled={!githubToken||syncing} onClick={()=>void saveToGist()}>{syncing?<Loader2 className={styles.spin} size={14}/>:<Cloud size={14}/>}クラウドへ保存</button><button disabled={!githubToken||!gistId||syncing} onClick={()=>void loadFromGist()}><Download size={14}/>クラウドから復元</button></div><aside><ShieldAlert size={14}/>トークンはローカル利用向けにブラウザ保存されます。公開・共有端末では使用しないでください。</aside></section>
      </div>}
      {message&&<p className={styles.success}>{message}</p>}{error&&<p className={styles.error}>{error}</p>}
    </div>
  );
}

export type { BackupData };
