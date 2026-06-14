'use client';

import { ArrowRight, CheckCircle2, Code2, Database, Globe2, Network, Rocket, Server, ShieldCheck, TestTube2 } from 'lucide-react';
import type { Lesson } from '@/types/learning';
import styles from './FullstackPath.module.css';

const phases = [
  { chapter:'Chapter 9 Webの土台', label:'Web Foundations', title:'Webの仕組みと画面の土台', description:'HTTP、HTML、CSS、ブラウザの役割を理解し、通信と表示を切り分けます。', skills:['HTTP','HTML','CSS','DevTools'], icon:Globe2 },
  { chapter:'Chapter 10 Reactフロントエンド', label:'Frontend', title:'Reactで操作できるUIを作る', description:'コンポーネント、Props、State、フォーム、副作用を型安全に扱います。', skills:['React','Props','State','Forms'], icon:Code2 },
  { chapter:'Chapter 11 Next.jsアプリ開発', label:'Fullstack Framework', title:'Next.jsで画面とサーバーをつなぐ', description:'App Router、Server/Client境界、データ取得、フォーム処理を学びます。', skills:['App Router','RSC','Cache','Actions'], icon:Network },
  { chapter:'Chapter 12 バックエンドAPI', label:'Backend', title:'APIとサーバーロジックを作る', description:'Node.js、Route Handler、REST、入力検証、ログ、環境変数を学びます。', skills:['Node.js','REST','Validation','Logs'], icon:Server },
  { chapter:'Chapter 13 データベース', label:'Database', title:'データを安全に保存する', description:'SQL、DB設計、Prisma CRUD、TransactionとIndexを学びます。', skills:['SQL','Schema','Prisma','Transaction'], icon:Database },
  { chapter:'Chapter 14 認証とセキュリティ', label:'Security', title:'利用者とデータを守る', description:'Session、Cookie、パスワード、認可、代表的なWeb攻撃を学びます。', skills:['Session','Authorization','Hash','XSS/CSRF'], icon:ShieldCheck },
  { chapter:'Chapter 15 品質と運用', label:'Quality & Operations', title:'壊れにくく運用できる状態にする', description:'単体・統合・E2Eテスト、Git、CI/CD、デプロイ、監視を学びます。', skills:['Testing','Git','CI/CD','Monitoring'], icon:TestTube2 },
  { chapter:'Chapter 16 卒業制作', label:'Capstone', title:'認証付きWebサービスを完成させる', description:'設計、API、DB、認可、テスト、公開を一つの成果物へまとめます。', skills:['Architecture','CRUD','Auth','Release'], icon:Rocket },
];

export default function FullstackPath({
  lessons,
  completed,
  onOpen,
}: {
  lessons: Lesson[];
  completed: string[];
  onOpen: (lesson: Lesson) => void;
}) {
  const fullstackLessons = lessons.filter((lesson) => Number(lesson.chapter.match(/\d+/)?.[0] || 0) >= 9);
  const completedCount = fullstackLessons.filter((lesson) => completed.includes(lesson.id)).length;
  const percentage = fullstackLessons.length ? Math.round(completedCount / fullstackLessons.length * 100) : 0;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div><span>FULLSTACK DEVELOPER PATH</span><h1>画面を作るだけでなく、<br />公開して運用できるところまで。</h1><p>Webの基礎からReact、Next.js、API、データベース、認証、テスト、デプロイまでを順番に学びます。最後は認証付きCRUDサービスの設計と公開まで完結します。</p><div><strong>{completedCount} / {fullstackLessons.length}</strong><small>フルスタック講座完了</small><i><em style={{width:`${percentage}%`}} /></i></div></div>
        <aside><Rocket size={35}/><small>COURSE COMPLETION</small><strong>{percentage}%</strong><p>{percentage>=100?'卒業制作まで完了しました':percentage>=60?'バックエンド実践へ進んでいます':percentage>=25?'Web全体の接続を学習中です':'Webの土台から始めましょう'}</p></aside>
      </section>

      <section className={styles.outcomes}>
        <article><Server size={20}/><strong>APIを設計・実装</strong><span>Route HandlerとREST</span></article>
        <article><Database size={20}/><strong>DBへ安全に保存</strong><span>SQL・Prisma・Transaction</span></article>
        <article><ShieldCheck size={20}/><strong>認証と権限制御</strong><span>Cookie・Session・認可</span></article>
        <article><Rocket size={20}/><strong>テストして公開</strong><span>CI/CD・監視・改善</span></article>
      </section>

      <div className={styles.title}><div><small>8 LEARNING PHASES</small><h2>フルスタック到達ロードマップ</h2></div><p>上から順番に進めると、前の知識が次の実装につながります。</p></div>
      <section className={styles.phases}>
        {phases.map((phase,index)=>{
          const phaseLessons=lessons.filter((lesson)=>lesson.chapter===phase.chapter);
          const phaseCompleted=phaseLessons.filter((lesson)=>completed.includes(lesson.id)).length;
          const phaseProgress=phaseLessons.length?Math.round(phaseCompleted/phaseLessons.length*100):0;
          const nextLesson=phaseLessons.find((lesson)=>!completed.includes(lesson.id))||phaseLessons[0];
          return <article key={phase.chapter} className={phaseProgress===100?styles.complete:''}>
            <div className={styles.number}>{phaseProgress===100?<CheckCircle2 size={17}/>:String(index+1).padStart(2,'0')}</div>
            <header><span><phase.icon size={18}/>{phase.label}</span><em>{phaseCompleted}/{phaseLessons.length}完了</em></header>
            <h2>{phase.title}</h2><p>{phase.description}</p>
            <div className={styles.skills}>{phase.skills.map((skill)=><span key={skill}>{skill}</span>)}</div>
            <i><em style={{width:`${phaseProgress}%`}} /></i>
            <button disabled={!nextLesson} onClick={()=>nextLesson&&onOpen(nextLesson)}>{phaseProgress===100?'復習する':index===7?'卒業制作へ':'この段階を学ぶ'}<ArrowRight size={14}/></button>
          </article>;
        })}
      </section>

      <section className={styles.finish}>
        <div><Rocket size={28}/><span>GRADUATION STANDARD</span><h2>最終的にできるようになること</h2></div>
        <ul>
          <li>要件から画面・API・DBのデータフローを設計する</li>
          <li>ReactとNext.jsでレスポンシブなUIを実装する</li>
          <li>入力検証・エラー処理付きREST APIを作る</li>
          <li>SQL・PrismaでリレーションとCRUDを実装する</li>
          <li>Session認証と所有者・ロール認可を実装する</li>
          <li>テスト、CI、デプロイ、ログ確認まで実施する</li>
        </ul>
      </section>
    </div>
  );
}
