'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Bot, BriefcaseBusiness, Check, CheckCircle2, Code2, Copy, Eye, Layers3, Loader2, Play, Plus, RotateCcw, Save, Sparkles, Terminal, Trash2, WandSparkles, XCircle } from 'lucide-react';
import { projects } from '@/data/projects';
import { getGeminiApiKey, getSelectedGeminiModel } from '@/lib/gemini-client';
import type { ProjectChallenge, ProjectProgress, QuestionDifficulty } from '@/types/platform';
import styles from './ProjectLab.module.css';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ProjectLab({
  progress,
  customProjects,
  onSave,
  onSaveProject,
  onDeleteProject,
  onAskAI,
  onSubmitPortfolio,
}: {
  progress: ProjectProgress[];
  customProjects: ProjectChallenge[];
  onSave: (progress: ProjectProgress) => void;
  onSaveProject: (project: ProjectChallenge) => void;
  onDeleteProject: (projectId: string) => void;
  onAskAI: (context: string) => void;
  onSubmitPortfolio: (project: ProjectChallenge, code: string) => void;
}) {
  const allProjects = [...projects, ...customProjects];
  const [projectId, setProjectId] = useState(projects[0].id);
  const project = allProjects.find((item) => item.id === projectId) || projects[0];
  const saved = progress.find((item) => item.projectId === project.id);
  const [codeByProject, setCodeByProject] = useState<Record<string,string>>({});
  const code = codeByProject[project.id] ?? saved?.code ?? project.starterCode;
  const [copyMode, setCopyMode] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [visibleHint, setVisibleHint] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ok:boolean;message:string;output?:string}|null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<QuestionDifficulty>('standard');
  const [minutes, setMinutes] = useState(60);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<ProjectChallenge|null>(null);
  const [generatorError, setGeneratorError] = useState('');
  const [isMock, setIsMock] = useState(false);

  const completedSteps = saved?.completedSteps || [];
  const similarity = (() => {
    const solutionLines = new Set(project.solution.split('\n').map((line) => line.trim()).filter(Boolean));
    const codeLines = code.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!solutionLines.size) return 0;
    return Math.round(codeLines.filter((line) => solutionLines.has(line)).length / solutionLines.size * 100);
  })();

  const persist = (nextCode = code, nextSteps = completedSteps) => {
    onSave({ projectId: project.id, code: nextCode, completedSteps: nextSteps, updatedAt: new Date().toISOString() });
  };

  const generateProject = async () => {
    if (topic.trim().length < 2 || generating) return;
    setGenerating(true);
    setGeneratorError('');
    setGenerated(null);
    try {
      const response = await fetch('/api/project-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          goal,
          level,
          minutes,
          apiKey: getGeminiApiKey(),
          model: getSelectedGeminiModel(),
        }),
      });
      const data = await response.json() as { success:boolean; project?:ProjectChallenge; error?:string; isMock?:boolean };
      if (!response.ok || !data.success || !data.project) throw new Error(data.error || '制作課題を生成できませんでした。');
      setGenerated(data.project);
      setIsMock(Boolean(data.isMock));
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : '制作課題を生成できませんでした。');
    } finally {
      setGenerating(false);
    }
  };

  const saveGeneratedProject = () => {
    if (!generated) return;
    onSaveProject(generated);
    setProjectId(generated.id);
    setCodeByProject((current) => ({ ...current, [generated.id]: generated.starterCode }));
    setGenerated(null);
    setGeneratorOpen(false);
    setResult(null);
  };

  const run = async () => {
    setRunning(true);
    try {
      const ts = await import('typescript');
      const compiled = ts.transpileModule(code, { compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.None,strict:true}, reportDiagnostics:true });
      const errors = (compiled.diagnostics || []).filter((item)=>item.category===ts.DiagnosticCategory.Error);
      if (errors.length) {
        setResult({ok:false,message:errors.map((item)=>ts.flattenDiagnosticMessageText(item.messageText,'\n')).join('\n')});
        return;
      }
      const logs:string[]=[];
      const learnerConsole={log:(...values:unknown[])=>logs.push(values.map((value)=>typeof value==='string'?value:JSON.stringify(value)).join(' '))};
      const execute = new Function('console',`"use strict";\n${compiled.outputText}`);
      execute(learnerConsole);
      const output=logs.join('\n');
      const ok=output.trim()===project.expectedOutput.trim();
      setResult({ok,message:ok?'すべてのテストケースに成功しました。':`期待する出力と異なります。類似度は${similarity}%です。`,output});
      persist();
    } catch (error) {
      setResult({ok:false,message:error instanceof Error?error.message:'実行できませんでした。'});
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}><div><span>MOSYA-STYLE PROJECT LAB</span><h1>要件を読み、ゼロから組み立てる</h1><p>API、DB、認証などの実務ロジックを、段階的ヒント、写経、TypeScript診断、出力テスト、AIレビューで身につけます。</p><button onClick={()=>setGeneratorOpen((value)=>!value)}><WandSparkles size={15}/>{generatorOpen?'生成画面を閉じる':'AIで制作課題を作る'}</button></div><Layers3 size={42}/></section>
      {generatorOpen&&<section className={styles.generator}>
        <div className={styles.generatorForm}><header><Sparkles size={19}/><div><small>AI PROJECT GENERATOR</small><h2>作りたいものを課題にする</h2></div></header><label>制作テーマ<input value={topic} onChange={(event)=>setTopic(event.target.value)} placeholder="例: タスクAPI、予約DB、認証付き投稿管理"/></label><label>達成したいこと<textarea value={goal} onChange={(event)=>setGoal(event.target.value)} placeholder="例: 入力検証と所有者認可を含むCRUDロジックを実装したい"/></label><div><label>難易度<select value={level} onChange={(event)=>setLevel(event.target.value as QuestionDifficulty)}><option value="basic">初級</option><option value="standard">標準</option><option value="advanced">応用</option></select></label><label>目安時間<select value={minutes} onChange={(event)=>setMinutes(Number(event.target.value))}><option value={30}>30分</option><option value={60}>60分</option><option value={90}>90分</option><option value={120}>120分</option></select></label></div><aside>{['RESTタスクAPI','Prisma CRUD','セッション認証','注文トランザクション'].map((item)=><button key={item} onClick={()=>setTopic(item)}>{item}</button>)}</aside>{generatorError&&<p className={styles.generatorError}>{generatorError}</p>}<button className={styles.generate} disabled={topic.trim().length<2||generating} onClick={()=>void generateProject()}>{generating?<Loader2 className={styles.spin} size={15}/>:<Sparkles size={15}/>} {generating?'課題を設計しています...':'AIで課題を生成'}</button><small>APIキー未設定時は、入力テーマに沿ったデモ課題を生成します。</small></div>
        <div className={styles.generatorPreview}>{!generated?<div><WandSparkles size={35}/><h2>課題の設計図を生成します</h2><p>完成条件、実装手順、段階的ヒント、スターターコード、テスト用出力までまとめて作成します。</p></div>:<article><header><div><span>{isMock?'DEMO PROJECT':'GEMINI PROJECT'}</span><h2>{generated.title}</h2></div><em>{generated.level}・{generated.minutes}分</em></header><p>{generated.summary}</p><div>{generated.skills.map((skill)=><span key={skill}>{skill}</span>)}</div><h3>完成条件</h3><ul>{generated.requirements.map((item)=><li key={item}><Check size={13}/>{item}</li>)}</ul><pre>{generated.starterCode}</pre><footer><button onClick={()=>void generateProject()}><RotateCcw size={14}/>作り直す</button><button onClick={saveGeneratedProject}><Save size={14}/>保存して開始</button></footer></article>}</div>
      </section>}
      <nav className={styles.projectTabs}>{allProjects.map((item)=><button key={item.id} className={item.id===project.id?styles.active:''} onClick={()=>{setProjectId(item.id);setResult(null);setShowSolution(false)}}><span>{item.source==='ai'?'AI PROJECT':item.level}</span><strong>{item.title}</strong><small>{item.minutes}分</small></button>)}<button className={styles.addProject} onClick={()=>setGeneratorOpen(true)}><Plus size={16}/><strong>AI課題を追加</strong><small>{customProjects.length}件保存</small></button></nav>
      <section className={styles.projectHeader}><div><span>{project.source==='ai'?'AI GENERATED PROJECT':`${project.level} PROJECT`}</span><h2>{project.title}</h2><p>{project.summary}</p><aside>{project.skills.map((skill)=><em key={skill}>{skill}</em>)}</aside>{project.source==='ai'&&<button className={styles.deleteProject} onClick={()=>{onDeleteProject(project.id);setProjectId(projects[0].id)}}><Trash2 size={13}/>このAI課題を削除</button>}</div><div><small>模範解答との一致行</small><strong>{similarity}%</strong><i><span style={{width:`${similarity}%`}}/></i></div></section>
      <div className={styles.workspace}>
        <aside className={styles.instructions}><h3>制作ステップ</h3>{project.steps.map((step,index)=>{const done=completedSteps.includes(index);return <article key={step.title} className={done?styles.done:''}><button onClick={()=>{const next=done?completedSteps.filter((value)=>value!==index):[...completedSteps,index];persist(code,next)}}>{done?<Check size={13}/>:index+1}</button><div><strong>{step.title}</strong><p>{step.description}</p><button onClick={()=>setVisibleHint(visibleHint===index?null:index)}>ヒントを見る</button>{visibleHint===index&&<small>{step.hint}</small>}</div></article>})}<h3>完成条件</h3><ul>{project.requirements.map((item)=><li key={item}><CheckCircle2 size={13}/>{item}</li>)}</ul><div className={styles.expected}><small>期待する出力</small><code>{project.expectedOutput}</code></div></aside>
        <main className={styles.editorArea}><header><span>project.ts</span><button onClick={()=>setCopyMode((value)=>!value)}><Copy size={14}/>{copyMode?'通常演習':'写経モード'}</button><button onClick={()=>setShowSolution((value)=>!value)}><Eye size={14}/>差分・解答</button><button onClick={()=>{setCodeByProject((current)=>({...current,[project.id]:copyMode?'':project.starterCode}));setResult(null)}}><RotateCcw size={14}/>リセット</button><button className={styles.run} disabled={running} onClick={()=>void run()}>{running?<Loader2 className={styles.spin} size={14}/>:<Play size={14}/>}実行</button></header>{copyMode&&<div className={styles.copyGuide}><Code2 size={15}/>模範コードを一度読み、見ずに再現します。詰まったら「差分・解答」を短時間だけ開きましょう。</div>}<Editor height="560px" language="typescript" theme="vs-dark" value={code} onChange={(value)=>{const next=value||'';setCodeByProject((current)=>({...current,[project.id]:next}));persist(next)}} options={{fontSize:14,lineHeight:23,minimap:{enabled:false},automaticLayout:true,wordWrap:'on',padding:{top:16,bottom:16}}}/></main>
      </div>
      <section className={styles.console}><header><Terminal size={15}/>TypeScript診断・テスト</header>{!result?<p>コードを実行すると型エラーと出力を確認します。</p>:<div className={result.ok?styles.success:styles.error}>{result.ok?<CheckCircle2 size={19}/>:<XCircle size={19}/>}<div><strong>{result.ok?'制作課題クリア':'修正が必要です'}</strong><p>{result.message}</p>{result.output!==undefined&&<pre>{result.output||'（出力なし）'}</pre>}</div></div>}<button onClick={()=>onAskAI(`制作課題: ${project.title}\n要件: ${project.requirements.join('、')}\n現在のコード:\n${code}\n実行結果: ${result?.message||'未実行'}\n答えを直接書き換えず、改善点と次の一手をレビューしてください。`)}><Bot size={14}/>AIコードレビュー</button>{result?.ok&&<button onClick={()=>onSubmitPortfolio(project,code)}><BriefcaseBusiness size={14}/>ポートフォリオへ提出</button>}</section>
      {showSolution&&<section className={styles.solution}><div><h3>模範解答と比較</h3><span>現在の一致行 {similarity}%</span></div><pre>{project.solution}</pre><p>丸写しではなく、自分のコードと異なる行が「なぜ必要か」を説明してから取り入れてください。</p></section>}
    </div>
  );
}
