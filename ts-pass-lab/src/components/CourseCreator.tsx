'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, Bot, Check, Clock3, Copy, Download, Loader2, Pencil, RotateCcw, Save, Sparkles, Trash2, Upload, WandSparkles } from 'lucide-react';
import { getGeminiApiKey, getSelectedGeminiModel } from '@/lib/gemini-client';
import { downloadJson } from '@/lib/learning-storage';
import type { Lesson, LessonLevel } from '@/types/learning';
import styles from './CourseCreator.module.css';

export default function CourseCreator({
  savedLessons,
  onSave,
  onOpen,
  onDelete,
  onUpdate,
  onDuplicate,
  onMove,
  onImport,
}: {
  savedLessons: Lesson[];
  onSave: (lesson: Lesson) => void;
  onOpen: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  onUpdate: (lesson: Lesson) => void;
  onDuplicate: (lesson: Lesson) => void;
  onMove: (lessonId: string, direction: -1 | 1) => void;
  onImport: (lessons: Lesson[]) => void;
}) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<LessonLevel>('basic');
  const [goal, setGoal] = useState('');
  const [minutes, setMinutes] = useState(35);
  const [preview, setPreview] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const generate = async () => {
    if (topic.trim().length < 2 || loading) return;
    setLoading(true);
    setError('');
    setPreview(null);
    try {
      const response = await fetch('/api/course-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          level,
          goal,
          minutes,
          apiKey: getGeminiApiKey(),
          model: getSelectedGeminiModel(),
        }),
      });
      const data = await response.json() as { success: boolean; lesson?: Lesson; error?: string; isMock?: boolean };
      if (!response.ok || !data.success || !data.lesson) throw new Error(data.error || '講座を生成できませんでした。');
      setPreview(data.lesson);
      setIsMock(Boolean(data.isMock));
    } catch (value) {
      setError(value instanceof Error ? value.message : 'AI講座を生成できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.creatorPage}>
      <section className={styles.hero}>
        <div>
          <span><WandSparkles size={15} /> AI COURSE STUDIO</span>
          <h1>学びたい内容から、<br />自分専用の講座を作る。</h1>
          <p>テーマ、難易度、目標を入力すると、AIが解説・コード例・理解チェック・演習まで含むTypeScript・Web開発講座を作成します。</p>
        </div>
        <div className={styles.flow}>
          <span><strong>1</strong>テーマを入力</span>
          <span><strong>2</strong>AIが教材を構成</span>
          <span><strong>3</strong>保存して演習</span>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.formCard}>
          <div className={styles.cardTitle}><Bot size={19} /><div><small>COURSE GENERATOR</small><h2>講座の設計</h2></div></div>

          <label>
            <span>学びたいテーマ</span>
            <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例: Route Handler、Prisma CRUD、Cookieセッション認証" />
          </label>

          <label>
            <span>この講座で達成したいこと</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例: APIから取得したunknownなデータを安全に検証できるようになりたい" />
          </label>

          <div className={styles.fieldRow}>
            <label>
              <span>難易度</span>
              <select value={level} onChange={(event) => setLevel(event.target.value as LessonLevel)}>
                <option value="basic">初級</option>
                <option value="standard">標準</option>
                <option value="advanced">応用</option>
              </select>
            </label>
            <label>
              <span>目安時間</span>
              <select value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
                <option value={20}>20分</option>
                <option value={35}>35分</option>
                <option value={50}>50分</option>
                <option value={75}>75分</option>
              </select>
            </label>
          </div>

          <div className={styles.suggestions}>
            <span>おすすめテーマ</span>
            <div>
              {['Reactフォーム', 'Next.js Route Handler', 'Prisma CRUD', 'セッション認証'].map((item) => (
                <button key={item} onClick={() => setTopic(item)}>{item}</button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.generateButton} disabled={topic.trim().length < 2 || loading} onClick={() => void generate()}>
            {loading ? <Loader2 className={styles.spin} size={17} /> : <Sparkles size={17} />}
            {loading ? '講座を構成しています...' : 'AIで講座を作成する'}
          </button>
          <small className={styles.notice}>APIキー未設定時は、入力テーマを使ったデモ講座を生成します。</small>
        </section>

        <section className={styles.previewCard}>
          {!preview ? (
            <div className={styles.emptyPreview}>
              <WandSparkles size={38} />
              <h2>生成した講座がここに表示されます</h2>
              <p>説明だけでなく、コード例・1行解説・比較・理解チェック・実践課題まで自動で構成します。</p>
            </div>
          ) : (
            <>
              <div className={styles.previewHeader}>
                <div><span>{isMock ? 'DEMO GENERATED' : 'GEMINI GENERATED'}</span><h2>{preview.title}</h2></div>
                <button onClick={() => setPreview(null)} aria-label="プレビューを閉じる"><RotateCcw size={16} /></button>
              </div>
              <p className={styles.previewSummary}>{preview.summary}</p>
              <div className={styles.previewMeta}>
                <span><Clock3 size={13} />{preview.minutes}分</span>
                <span>{preview.level}</span>
                <span>{preview.sections.length}セクション</span>
              </div>
              <div className={styles.previewGoals}>
                <h3>学習ゴール</h3>
                {preview.learningGoals.map((item) => <p key={item}><Check size={14} />{item}</p>)}
              </div>
              <div className={styles.previewCode}><small>CODE PREVIEW</small><pre>{preview.code}</pre></div>
              <div className={styles.previewActions}>
                <button onClick={() => void generate()}><RotateCcw size={15} />作り直す</button>
                <button onClick={() => onSave(preview)}><BookOpen size={15} />保存して学習する</button>
              </div>
            </>
          )}
        </section>
      </div>

      <section className={styles.library}>
        <div className={styles.libraryTitle}><div><small>MY AI COURSES</small><h2>保存したカスタム講座</h2></div><div className={styles.libraryTools}><button onClick={() => downloadJson('ts-pass-lab-ai-courses.json', savedLessons)}><Download size={13} />JSON書出し</button><label><Upload size={13} />JSON読込<input type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const value = JSON.parse(await file.text()) as Lesson[]; if (Array.isArray(value)) onImport(value); } catch { /* Invalid course files are ignored safely. */ } }} /></label><span>{savedLessons.length}講座</span></div></div>
        {editing && <section className={styles.editor}><header><div><small>COURSE EDITOR</small><h3>講座内容を編集</h3></div><button onClick={() => setEditing(null)}><RotateCcw size={14} />閉じる</button></header><label>講座名<input value={editing.title} onChange={(event) => setEditing({...editing,title:event.target.value})} /></label><label>概要<textarea value={editing.summary} onChange={(event) => setEditing({...editing,summary:event.target.value})} /></label><label>重要性<textarea value={editing.whyImportant} onChange={(event) => setEditing({...editing,whyImportant:event.target.value})} /></label><label>基本コード<textarea className={styles.codeInput} value={editing.code} onChange={(event) => setEditing({...editing,code:event.target.value,exercise:{...editing.exercise,solution:event.target.value}})} /></label><button className={styles.saveEdit} onClick={() => { onUpdate(editing); setEditing(null); }}><Save size={14} />変更を保存</button></section>}
        {savedLessons.length === 0 ? (
          <div className={styles.emptyLibrary}>まだ保存した講座はありません。苦手なテーマや今作っているアプリの技術を講座にしてみましょう。</div>
        ) : (
          <div className={styles.savedGrid}>
            {savedLessons.map((lesson) => (
              <article key={lesson.id}>
                <div><span>AI COURSE</span><aside><button onClick={() => onMove(lesson.id,-1)} aria-label={`${lesson.title}を上へ`}><ArrowUp size={13} /></button><button onClick={() => onMove(lesson.id,1)} aria-label={`${lesson.title}を下へ`}><ArrowDown size={13} /></button><button onClick={() => setEditing(lesson)} aria-label={`${lesson.title}を編集`}><Pencil size={13} /></button><button onClick={() => onDuplicate(lesson)} aria-label={`${lesson.title}を複製`}><Copy size={13} /></button><button onClick={() => onDelete(lesson.id)} aria-label={`${lesson.title}を削除`}><Trash2 size={14} /></button></aside></div>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <footer><span>{lesson.minutes}分・{lesson.level}</span><button onClick={() => onOpen(lesson)}>学習する</button></footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
