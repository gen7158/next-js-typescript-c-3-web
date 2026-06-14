'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BookMarked,
  Bot,
  BriefcaseBusiness,
  Braces,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Code2,
  Flame,
  Gauge,
  GraduationCap,
  Home,
  Layers3,
  Library,
  Lightbulb,
  ListChecks,
  Menu,
  MessageCircleQuestion,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Target,
  Trophy,
  WandSparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import AITutorDrawer from '@/components/AITutorDrawer';
import BeginnerGuide from '@/components/BeginnerGuide';
import CodeWorkspace from '@/components/CodeWorkspace';
import CourseCreator from '@/components/CourseCreator';
import ExamCenter from '@/components/ExamCenter';
import FullstackPath from '@/components/FullstackPath';
import GeminiSettings from '@/components/GeminiSettings';
import PortfolioStudio, { type PortfolioDraft } from '@/components/PortfolioStudio';
import PracticeCenter from '@/components/PracticeCenter';
import ProjectLab from '@/components/ProjectLab';
import ResourceCenter, { type BackupData } from '@/components/ResourceCenter';
import StudyPlanner from '@/components/StudyPlanner';
import { lessons } from '@/data/lessons';
import { questions } from '@/data/questions';
import { createAttempt, initialLearningData, LESSON_CODE_KEY, loadLearningData, loadLessonCodeRecords, removeLessonCodeRecord, saveLearningData } from '@/lib/learning-storage';
import { getLearningStage } from '@/lib/lesson-guidance';
import { dueReviewIds, levelFromXp, weakestCategories } from '@/lib/scoring';
import type { Lesson, LessonCodeRecord } from '@/types/learning';
import type { ExamResult, LearningData, PortfolioSubmission, ProjectChallenge, ProjectProgress, Question, StudyPlan } from '@/types/platform';
import styles from './page.module.css';

type View = 'dashboard' | 'fullstack' | 'roadmap' | 'lesson' | 'practice' | 'review' | 'analytics' | 'exam' | 'projects' | 'portfolio' | 'planner' | 'creator' | 'resources' | 'settings';
type LessonTab = 'guide' | 'examples' | 'exercise' | 'ai' | 'summary';

const navItems: { id: View; label: string; short: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'ダッシュボード', short: 'ホーム', icon: Home },
  { id: 'fullstack', label: 'フルスタックコース', short: '総合', icon: Network },
  { id: 'roadmap', label: '全講座ロードマップ', short: '講座', icon: BookOpen },
  { id: 'practice', label: '問題演習', short: '演習', icon: Braces },
  { id: 'review', label: '復習', short: '復習', icon: RefreshCw },
  { id: 'analytics', label: '苦手分析', short: '分析', icon: BrainCircuit },
  { id: 'exam', label: '模擬試験', short: '模試', icon: ClipboardCheck },
  { id: 'projects', label: '制作課題', short: '制作', icon: Layers3 },
  { id: 'portfolio', label: 'ポートフォリオ', short: '作品', icon: BriefcaseBusiness },
  { id: 'planner', label: '学習計画', short: '計画', icon: CalendarDays },
  { id: 'creator', label: 'AI講座作成', short: 'AI作成', icon: WandSparkles },
  { id: 'resources', label: '辞典・実績', short: '辞典', icon: Library },
  { id: 'settings', label: '設定', short: '設定', icon: Settings },
];

const lessonTabs: { id: LessonTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'guide', label: '解説', icon: BookOpen },
  { id: 'examples', label: 'コード例', icon: Code2 },
  { id: 'exercise', label: '演習', icon: Play },
  { id: 'ai', label: 'AI解説', icon: Bot },
  { id: 'summary', label: 'まとめ', icon: ListChecks },
];

const statCards: { label: string; getValue: (data: { progress: number; completed: number; total: number; streak: number; correct: number }) => string; note: string; icon: LucideIcon }[] = [
  { label: '総合進捗', getValue: ({ progress }) => `${progress}%`, note: 'レッスン進捗', icon: Target },
  { label: '学習レッスン', getValue: ({ completed, total }) => `${completed}/${total}`, note: 'ロードマップ', icon: CheckCircle2 },
  { label: '連続学習', getValue: ({ streak }) => `${streak}日`, note: '今日も続けよう', icon: Flame },
  { label: '演習正答', getValue: ({ correct }) => `${correct}問`, note: '問題演習の結果', icon: Trophy },
];

const learningRoutes: { title: string; description: string; tags: string[]; icon: LucideIcon; target: View }[] = [
  {
    title: 'フルスタック総合',
    description: 'Web基礎からReact、API、DB、認証、テスト、公開まで順番に完結します。',
    tags: ['Next.js', 'API', 'DB'],
    icon: Network,
    target: 'fullstack',
  },
  {
    title: 'TypeScript基礎',
    description: '基本型から順番に、型安全なコードの読み書きと型設計を身につけます。',
    tags: ['基本型', '関数', '型設計'],
    icon: BookOpen,
    target: 'roadmap',
  },
  {
    title: 'バックエンド重点',
    description: 'Route Handler、REST、SQL、Prisma、認証・認可を重点的に学びます。',
    tags: ['Backend', 'Prisma', 'Auth'],
    icon: Layers3,
    target: 'fullstack',
  },
];

function isSavedLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== 'object') return false;
  const lesson = value as Partial<Lesson>;
  return typeof lesson.id === 'string'
    && typeof lesson.title === 'string'
    && typeof lesson.summary === 'string'
    && typeof lesson.code === 'string'
    && Array.isArray(lesson.sections)
    && Array.isArray(lesson.checkpoints)
    && Boolean(lesson.exercise && typeof lesson.exercise === 'object');
}

export default function HomePage() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [lessonTab, setLessonTab] = useState<LessonTab>('guide');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [easyMode, setEasyMode] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [studyDates, setStudyDates] = useState<string[]>([]);
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [learningData, setLearningData] = useState<LearningData>(initialLearningData);
  const [portfolioDraft, setPortfolioDraft] = useState<PortfolioDraft | null>(null);
  const [lessonCodeRecords, setLessonCodeRecords] = useState<Record<string, LessonCodeRecord>>({});
  const [reattendLesson, setReattendLesson] = useState<Lesson | null>(null);

  const allLessons = useMemo(
    () => [
      ...lessons,
      ...customLessons.map((lesson, index) => ({ ...lesson, step: lessons.length + index + 1, source: 'ai' as const })),
    ],
    [customLessons],
  );
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) || allLessons[0];
  const chapters = useMemo(() => [...new Set(allLessons.map((lesson) => lesson.chapter))], [allLessons]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem('ts-pass-lab-progress');
        if (saved) {
          const parsed = JSON.parse(saved) as { completed?: string[]; studyDates?: string[] };
          setCompleted(Array.isArray(parsed.completed) ? parsed.completed : []);
          setStudyDates(Array.isArray(parsed.studyDates) ? parsed.studyDates : []);
        }
        const savedCustomLessons = localStorage.getItem('ts-pass-lab-custom-lessons');
        if (savedCustomLessons) {
          const parsedLessons = JSON.parse(savedCustomLessons) as unknown;
          setCustomLessons(Array.isArray(parsedLessons) ? parsedLessons.filter(isSavedLesson) : []);
        }
        setLearningData(loadLearningData());
        setLessonCodeRecords(loadLessonCodeRecords());
        setEasyMode(localStorage.getItem('ts-pass-lab-easy-mode') !== 'off');
      } catch {
        localStorage.removeItem('ts-pass-lab-progress');
        localStorage.removeItem('ts-pass-lab-custom-lessons');
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const saveProgress = (nextCompleted: string[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextDates = studyDates.includes(today) ? studyDates : [...studyDates, today];
    setCompleted(nextCompleted);
    setStudyDates(nextDates);
    localStorage.setItem('ts-pass-lab-progress', JSON.stringify({ completed: nextCompleted, studyDates: nextDates }));
  };

  const enterLesson = (lesson: Lesson, tab: LessonTab = 'guide') => {
    setLessonCodeRecords(loadLessonCodeRecords());
    setSelectedLessonId(lesson.id);
    setLessonTab(tab);
    setView('lesson');
    setMobileMenu(false);
    if (tab === 'exercise') setSidebarCollapsed(true);
  };

  const openLesson = (lesson: Lesson, tab: LessonTab = 'guide') => {
    const latestRecords = loadLessonCodeRecords();
    setLessonCodeRecords(latestRecords);
    if (completed.includes(lesson.id) && latestRecords[lesson.id]) {
      setReattendLesson(lesson);
      return;
    }
    enterLesson(lesson, tab);
  };

  const saveCustomLesson = (lesson: Lesson) => {
    const savedLesson = { ...lesson, step: lessons.length + customLessons.length + 1, source: 'ai' as const };
    const next = [...customLessons.filter((item) => item.id !== savedLesson.id), savedLesson];
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
    openLesson(savedLesson);
  };

  const updateCustomLesson = (lesson: Lesson) => {
    const next = customLessons.map((item) => item.id === lesson.id ? lesson : item);
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
  };

  const duplicateCustomLesson = (lesson: Lesson) => {
    const copy = { ...lesson, id: `ai-${Date.now()}`, title: `${lesson.title}（コピー）`, exercise: { ...lesson.exercise, id: `ai-${Date.now()}-exercise` } };
    const next = [...customLessons, copy];
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
  };

  const moveCustomLesson = (lessonId: string, direction: -1 | 1) => {
    const index = customLessons.findIndex((lesson) => lesson.id === lessonId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= customLessons.length) return;
    const next = [...customLessons];
    [next[index], next[target]] = [next[target], next[index]];
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
  };

  const importCustomLessons = (imported: Lesson[]) => {
    const safe = imported.filter(isSavedLesson).map((lesson) => ({ ...lesson, source: 'ai' as const }));
    const next = [...customLessons, ...safe.filter((lesson) => !customLessons.some((item) => item.id === lesson.id))];
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
  };

  const deleteCustomLesson = (lessonId: string) => {
    const next = customLessons.filter((lesson) => lesson.id !== lessonId);
    setCustomLessons(next);
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(next));
    setCompleted((current) => current.filter((id) => id !== lessonId));
    if (selectedLessonId === lessonId) setSelectedLessonId(lessons[0].id);
  };

  const openAI = (context?: string, suggestedPrompt = '') => {
    setAiContext(context || [
      `レッスン: ${selectedLesson.title}`,
      selectedLesson.summary,
      `重要ポイント: ${selectedLesson.keyPoints.join('、')}`,
    ].join('\n'));
    setAiSuggestedPrompt(suggestedPrompt);
    setAiOpen(true);
  };

  const handleFocusChange = useCallback((focused: boolean) => {
    setFocusMode(focused);
  }, []);

  const updateLearningData = (updater: (current: LearningData) => LearningData) => {
    setLearningData((current) => {
      const next = updater(current);
      saveLearningData(next);
      return next;
    });
  };

  const recordAnswer = (question: Question, selected: number) => {
    updateLearningData((current) => {
      const correct = selected === question.answer;
      const attempt = createAttempt(question.id, question.category, correct, selected, current.attempts);
      return {
        ...current,
        attempts: [...current.attempts, attempt],
        reviewList: correct ? current.reviewList : [...new Set([...current.reviewList, question.id])],
        xp: current.xp + (correct ? 10 : 3),
      };
    });
  };

  const toggleListItem = (key: 'favorites' | 'reviewList', id: string) => {
    updateLearningData((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id],
    }));
  };

  const completeExam = (result: ExamResult) => {
    updateLearningData((current) => ({
      ...current,
      examHistory: [result, ...current.examHistory].slice(0, 20),
      reviewList: [...new Set([...current.reviewList, ...result.wrongQuestionIds])],
      xp: current.xp + result.score * 5 + (result.passed ? 50 : 0),
    }));
  };

  const saveStudyPlan = (plan: StudyPlan) => updateLearningData((current) => ({ ...current, studyPlans: [plan, ...current.studyPlans] }));
  const togglePlanDay = (planId: string, day: number) => updateLearningData((current) => ({ ...current, studyPlans: current.studyPlans.map((plan) => plan.id === planId ? { ...plan, days: plan.days.map((item) => item.day === day ? { ...item, completed: !item.completed } : item) } : plan) }));
  const saveProjectProgress = (project: ProjectProgress) => updateLearningData((current) => ({ ...current, projectProgress: [...current.projectProgress.filter((item) => item.projectId !== project.projectId), project] }));
  const saveCustomProject = (project: ProjectChallenge) => updateLearningData((current) => ({ ...current, customProjects: [...current.customProjects.filter((item) => item.id !== project.id), project] }));
  const deleteCustomProject = (projectId: string) => updateLearningData((current) => ({ ...current, customProjects: current.customProjects.filter((item) => item.id !== projectId), projectProgress: current.projectProgress.filter((item) => item.projectId !== projectId) }));
  const savePortfolioSubmission = (submission: PortfolioSubmission) => updateLearningData((current) => ({
    ...current,
    portfolioSubmissions: [submission, ...current.portfolioSubmissions],
    xp: current.xp + Math.max(20, Math.round(submission.score.total / 2)),
  }));
  const deletePortfolioSubmission = (submissionId: string) => updateLearningData((current) => ({
    ...current,
    portfolioSubmissions: current.portfolioSubmissions.filter((item) => item.id !== submissionId),
  }));

  const restoreBackup = (backup: BackupData) => {
    const restoredLearningData = { ...initialLearningData, ...backup.learningData, customProjects: Array.isArray(backup.learningData.customProjects) ? backup.learningData.customProjects : [] };
    setLearningData(restoredLearningData);
    saveLearningData(restoredLearningData);
    setCustomLessons(backup.customLessons.filter(isSavedLesson));
    localStorage.setItem('ts-pass-lab-custom-lessons', JSON.stringify(backup.customLessons.filter(isSavedLesson)));
    setCompleted(backup.progress.completed);
    setStudyDates(backup.progress.studyDates);
    localStorage.setItem('ts-pass-lab-progress', JSON.stringify(backup.progress));
    const restoredLessonCodes = backup.lessonCodeRecords && typeof backup.lessonCodeRecords === 'object' ? backup.lessonCodeRecords : {};
    setLessonCodeRecords(restoredLessonCodes);
    localStorage.setItem(LESSON_CODE_KEY, JSON.stringify(restoredLessonCodes));
    if (backup.selectedModel) localStorage.setItem('ts-pass-lab-gemini-model', backup.selectedModel);
  };

  const progress = Math.round((completed.filter((id) => allLessons.some((lesson) => lesson.id === id)).length / allLessons.length) * 100);
  const streak = useMemo(() => {
    if (!studyDates.length) return 0;
    const sorted = [...new Set(studyDates)].sort().reverse();
    let count = 1;
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = new Date(`${sorted[index - 1]}T00:00:00`);
      const current = new Date(`${sorted[index]}T00:00:00`);
      if ((previous.getTime() - current.getTime()) / 86400000 !== 1) break;
      count += 1;
    }
    return count;
  }, [studyDates]);

  const correctAnswers = learningData.attempts.filter((attempt) => attempt.correct).length;
  const weakCategoryNames = weakestCategories(learningData.attempts).map(([name]) => name);
  const dueReviews = dueReviewIds(learningData);
  const answerAccuracy = learningData.attempts.length ? Math.round(correctAnswers / learningData.attempts.length * 100) : 0;
  const learnerLevel = levelFromXp(learningData.xp);
  const latestExam = learningData.examHistory[0];
  const nextLesson = allLessons.find((lesson) => !completed.includes(lesson.id)) || allLessons[allLessons.length - 1];
  const currentStage = getLearningStage(nextLesson.step);
  const toggleEasyMode = () => {
    const next = !easyMode;
    setEasyMode(next);
    localStorage.setItem('ts-pass-lab-easy-mode', next ? 'on' : 'off');
  };

  return (
    <div className={`${styles.app} ${sidebarCollapsed ? styles.collapsed : ''} ${focusMode ? styles.focusedApp : ''} ${easyMode ? styles.easyMode : ''}`}>
      {!focusMode && (
        <>
          <aside className={styles.sidebar}>
            <button className={styles.brand} onClick={() => setView('dashboard')}>
              <span>TS</span>
              {!sidebarCollapsed && <div><strong>TS PASS LAB</strong><small>Fullstack Web Academy</small></div>}
            </button>
            <nav className={styles.mainNav}>
              {navItems.map((item) => <button key={item.id} title={sidebarCollapsed ? item.label : undefined} className={view === item.id || (view === 'lesson' && item.id === 'roadmap') ? styles.activeNav : ''} onClick={() => setView(item.id)}><item.icon size={18} />{!sidebarCollapsed && item.label}</button>)}
              <button title={sidebarCollapsed ? 'AIチューター' : undefined} onClick={() => openAI()}><Bot size={18} />{!sidebarCollapsed && 'AIチューター'}</button>
            </nav>

            {view === 'lesson' && (
              <div className={styles.lessonSteps}>
                {!sidebarCollapsed && <p>レッスンステップ</p>}
                {allLessons.map((lesson) => <button key={lesson.id} title={sidebarCollapsed ? `${lesson.step}. ${lesson.title}` : undefined} className={lesson.id === selectedLesson.id ? styles.currentStep : ''} onClick={() => openLesson(lesson)}><span>{completed.includes(lesson.id) ? <Check size={13} /> : lesson.source === 'ai' ? 'AI' : lesson.step}</span>{!sidebarCollapsed && <em>{lesson.title}</em>}</button>)}
              </div>
            )}

            <button className={styles.collapseButton} onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} />折りたたむ</>}</button>
          </aside>

          {mobileMenu && <button className={styles.mobileBackdrop} onClick={() => setMobileMenu(false)} aria-label="メニューを閉じる" />}
          <aside className={`${styles.mobileDrawer} ${mobileMenu ? styles.mobileOpen : ''}`}>
            <div className={styles.mobileDrawerHeader}><strong>TS PASS LAB</strong><button onClick={() => setMobileMenu(false)}><X size={20} /></button></div>
            {navItems.map((item) => <button key={item.id} onClick={() => { setView(item.id); setMobileMenu(false); }}><item.icon size={18} />{item.label}</button>)}
            <button onClick={() => { openAI(); setMobileMenu(false); }}><Bot size={18} />AIチューター</button>
          </aside>

          <header className={styles.topbar}>
            <button className={styles.mobileMenuButton} onClick={() => setMobileMenu(true)}><Menu size={20} /></button>
            <button className={styles.desktopCollapse} onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
            <div><small>FULLSTACK WEB LEARNING PLATFORM</small><strong>{view === 'dashboard' ? '学習ダッシュボード' : view === 'fullstack' ? 'フルスタックコース' : view === 'roadmap' ? '全講座ロードマップ' : view === 'lesson' ? selectedLesson.title : view === 'practice' ? '問題演習' : view === 'review' ? '復習' : view === 'analytics' ? '苦手分析' : view === 'exam' ? '模擬試験' : view === 'projects' ? '制作課題' : view === 'portfolio' ? 'ポートフォリオ工房' : view === 'planner' ? 'AI学習計画' : view === 'creator' ? 'AI講座作成' : view === 'resources' ? '辞典・実績' : '設定'}</strong></div>
            <span className={styles.levelBadge}>Fullstack Path</span>
            <button className={styles.easyButton} onClick={toggleEasyMode}><MessageCircleQuestion size={15} />やさしい表示 {easyMode ? 'ON' : 'OFF'}</button>
            <button className={styles.aiButton} onClick={() => openAI()}><Bot size={16} />AIチューター</button>
          </header>
        </>
      )}

      <main className={`${styles.main} ${focusMode ? styles.focusMain : ''}`}>
        {view === 'dashboard' && (
          <div className={styles.page}>
            <section className={styles.hero}>
              <div><small>YOUR FULLSTACK WEB JOURNEY</small><h1>初心者から、作品で語れる<br /><span>フルスタックエンジニアへ。</span></h1><p>{lessons.length}の標準講座、{questions.length}問の演習、制作課題、AIコーチを通して、TypeScriptの最初の一行から認証付きWebサービスの公開・ポートフォリオ提出まで進みます。</p><div><button onClick={() => setView('fullstack')}><Network size={16} />総合コースを始める</button><button onClick={() => setView('practice')}><Braces size={16} />問題演習</button><button onClick={() => setView('portfolio')}><BriefcaseBusiness size={16} />作品を育てる</button></div></div>
              <div className={styles.readiness}><small>LEARNING READINESS</small><Gauge size={22} /><strong>{Math.max(12, progress)}%</strong><span>{progress >= 70 ? '実践レベル' : progress >= 35 ? '基礎定着中' : '学習スタート'}</span><div><i style={{ width: `${Math.max(12, progress)}%` }} /></div></div>
            </section>

            <section className={styles.stats}>
              {statCards.map((card) => <article key={card.label}><div><small>{card.label}</small><strong>{card.getValue({ progress, completed: completed.length, total: allLessons.length, streak, correct: correctAnswers })}</strong><span>{card.note}</span></div><span><card.icon size={17} /></span></article>)}
            </section>

            <section className={styles.careerStage}>
              <div><small>CURRENT LEARNING STAGE</small><span>{currentStage.label}</span><h2>{currentStage.title}</h2><p>{currentStage.description}</p></div>
              <ol>
                {['はじめて', 'TS基礎', 'Web基礎', 'Frontend', 'Backend・DB', '品質・運用', 'Portfolio'].map((stage, index) => {
                  const active = Math.min(6, Math.floor((nextLesson.step - 1) / 10)) >= index;
                  return <li className={active ? styles.stageActive : ''} key={stage}><i>{active ? <Check size={12}/> : index + 1}</i><span>{stage}</span></li>;
                })}
              </ol>
            </section>

            <section className={styles.today}>
              <span><Play size={20} fill="currentColor" /></span>
              <div><small>TODAY&apos;S MISSION</small><h2>{(allLessons.find((lesson) => !completed.includes(lesson.id)) || allLessons[0]).title}</h2><p>まず解説を読み、コード例を確認してから演習へ進みましょう。</p></div>
              <button onClick={() => openLesson(allLessons.find((lesson) => !completed.includes(lesson.id)) || allLessons[0])}>学習を始める<ArrowRight size={15} /></button>
            </section>

            <section className={styles.learningPulse}>
              <article><span><Trophy size={18} /></span><div><small>LEVEL & XP</small><strong>Lv.{learnerLevel}</strong><p>{learningData.xp % 250} / 250 XP</p></div><i><em style={{ width: `${learningData.xp % 250 / 250 * 100}%` }} /></i></article>
              <article><span><BookMarked size={18} /></span><div><small>SPACED REVIEW</small><strong>{dueReviews.length}問</strong><p>今日までの復習対象</p></div><button onClick={() => setView('review')}>復習する<ArrowRight size={13} /></button></article>
              <article><span><Gauge size={18} /></span><div><small>ANSWER ACCURACY</small><strong>{answerAccuracy}%</strong><p>{learningData.attempts.length}回答の集計</p></div><button onClick={() => setView('analytics')}>分析を見る<ArrowRight size={13} /></button></article>
              <article><span><ClipboardCheck size={18} /></span><div><small>LATEST EXAM</small><strong>{latestExam ? `${latestExam.percentage}%` : '未受験'}</strong><p>{weakCategoryNames[0] ? `重点: ${weakCategoryNames[0]}` : '演習後に弱点を表示'}</p></div><button onClick={() => setView('exam')}>{latestExam ? '再受験' : '受験する'}<ArrowRight size={13} /></button></article>
            </section>

            <div className={styles.sectionTitle}><div><small>LEARNING PATHS</small><h2>あなたに合う学習ルート</h2></div><button onClick={() => setView('roadmap')}>すべて見る<ArrowRight size={14} /></button></div>
            <section className={styles.routes}>
              {learningRoutes.map((route) => <article key={route.title}><span><route.icon size={20} /></span><h3>{route.title}</h3><p>{route.description}</p><div>{route.tags.map((tag) => <em key={tag}>{tag}</em>)}</div><button onClick={() => setView(route.target)}>このルートで始める<ArrowRight size={14} /></button></article>)}
            </section>
          </div>
        )}

        {view === 'fullstack' && <FullstackPath lessons={allLessons} completed={completed} onOpen={openLesson} />}

        {view === 'roadmap' && (
          <div className={styles.page}>
            <section className={styles.pageHero}><small>{allLessons.length} LEARNING MODULES</small><h1>TypeScript・Webフルスタック講座</h1><p>TypeScript基礎からReact、Next.js、バックエンドAPI、データベース、認証、テスト、運用まで章ごとに理解を積み上げます。</p><div><span>{completed.length} / {allLessons.length} 完了</span><i><b style={{ width: `${progress}%` }} /></i></div></section>
            {chapters.map((chapter, chapterIndex) => (
              <section className={styles.chapterSection} key={chapter}>
                <header><div><span>CHAPTER {chapterIndex + 1}</span><h2>{chapter.replace(/^Chapter \d+\s*/, '')}</h2></div><small>{allLessons.filter((lesson) => lesson.chapter === chapter).length}講座</small></header>
                <div className={styles.lessonGrid}>
                  {allLessons.filter((lesson) => lesson.chapter === chapter).map((lesson) => <article key={lesson.id}><div><span>{lesson.source === 'ai' ? 'AI COURSE' : `STEP ${lesson.step}`}</span><em>{lesson.level}</em>{completed.includes(lesson.id) && <strong><Check size={13} />完了</strong>}</div><h2>{lesson.title}</h2><p>{lesson.summary}</p><dl><div><Clock3 size={13} /><dt>{lesson.minutes}分</dt></div><div><BarChart3 size={13} /><dt>{lesson.category}</dt></div></dl><button onClick={() => openLesson(lesson)}>学習する<ArrowRight size={14} /></button></article>)}
                </div>
              </section>
            ))}
          </div>
        )}

        {view === 'lesson' && (
          <div className={lessonTab === 'exercise' ? styles.widePage : styles.lessonPage}>
            {!focusMode && <>
              <div className={styles.lessonNav}><button onClick={() => setView('roadmap')}><ArrowLeft size={14} />ロードマップ</button><div>{allLessons[selectedLesson.step - 2] && <button onClick={() => openLesson(allLessons[selectedLesson.step - 2])}><ArrowLeft size={14} />前へ</button>}{allLessons[selectedLesson.step] && <button onClick={() => openLesson(allLessons[selectedLesson.step])}>次へ<ArrowRight size={14} /></button>}</div></div>
              <section className={styles.lessonHero}><div><span>{selectedLesson.source === 'ai' ? 'AI COURSE' : `STEP ${selectedLesson.step}`}</span><span>{selectedLesson.chapter}</span><span>{selectedLesson.level}</span><span>{selectedLesson.minutes}分</span><h1>{selectedLesson.title}</h1><p>{selectedLesson.summary}</p></div><button onClick={() => openAI()}><Bot size={16} />このレッスンをAIに質問</button></section>
              <nav className={styles.lessonTabs}>{lessonTabs.map((tab) => <button key={tab.id} className={lessonTab === tab.id ? styles.activeTab : ''} onClick={() => { setLessonTab(tab.id); if (tab.id === 'exercise') setSidebarCollapsed(true); }}><tab.icon size={15} />{tab.label}</button>)}</nav>
            </>}

            {lessonTab === 'guide' && <div className={styles.lessonContent}>
              {easyMode && <BeginnerGuide lesson={selectedLesson} />}
              <div className={styles.twoCards}><article><Target size={20} /><h2>このレッスンで学ぶこと</h2><ul>{selectedLesson.learningGoals.map((item) => <li key={item}>{item}</li>)}</ul></article><article><GraduationCap size={20} /><h2>今日のゴール</h2><p>{selectedLesson.exercise.description}</p></article></div>
              <article className={styles.contentCard}><Lightbulb size={22} /><small>WHY IT MATTERS</small><h2>なぜ重要なのか</h2><p>{selectedLesson.whyImportant}</p></article>
              {selectedLesson.sections.map((section) => <article className={styles.contentCard} key={section.title}><GraduationCap size={22} /><small>DEEP LEARNING</small><h2>{section.title}</h2><p>{section.description}</p><ul className={styles.pointList}>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>{section.code && <pre>{section.code}</pre>}</article>)}
              <div className={styles.twoCards}><article><AlertTriangle size={20} /><h2>初心者がつまずく点</h2><ul>{selectedLesson.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></article><article><ListChecks size={20} /><h2>最初に覚えるポイント</h2><ul>{selectedLesson.keyPoints.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
              <article className={styles.contentCard}><Braces size={22} /><small>COMPARE</small><h2>似た機能との使い分け</h2><ul className={styles.pointList}>{selectedLesson.comparisons.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className={styles.contentCard}><Code2 size={22} /><small>BASIC SYNTAX</small><h2>基本構文</h2><pre>{selectedLesson.syntax}</pre><p>入力と出力、実行場所、型の対応を確認し、この構文がWebアプリのどの役割を担うか読み取りましょう。</p></article>
              <article className={styles.contentCard}><CheckCircle2 size={22} /><small>KNOWLEDGE CHECK</small><h2>理解チェック</h2><div className={styles.checkpoints}>{selectedLesson.checkpoints.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></article>
              <div className={styles.nextAction}><button onClick={() => setLessonTab('examples')}>コード例へ進む<ArrowRight size={15} /></button></div>
            </div>}

            {lessonTab === 'examples' && <div className={styles.lessonContent}><article className={styles.contentCard}><Code2 size={22} /><small>CODE EXAMPLE</small><h2>{selectedLesson.title}の基本例</h2><pre>{selectedLesson.code}</pre><div className={styles.output}><span>実行結果</span><code>{selectedLesson.output}</code></div><div className={styles.lines}>{selectedLesson.lineByLine.map((line, index) => <p key={`${line}-${index}`}><span>{index + 1}</span>{line}</p>)}</div></article>{selectedLesson.extraExamples.map((example) => <article className={styles.contentCard} key={example.title}><Sparkles size={22} /><small>TRY ANOTHER</small><h2>{example.title}</h2><p>{example.description}</p><pre>{example.code}</pre><div className={styles.output}><span>実行結果</span><code>{example.output}</code></div></article>)}<div className={styles.nextAction}><button onClick={() => { setLessonTab('exercise'); setSidebarCollapsed(true); }}>コード演習へ進む<ArrowRight size={15} /></button></div></div>}

            {lessonTab === 'exercise' && <CodeWorkspace
              key={`${selectedLesson.id}-${lessonCodeRecords[selectedLesson.id]?.updatedAt || 'new'}`}
              lesson={selectedLesson}
              initialCode={lessonCodeRecords[selectedLesson.id]?.code}
              nextLessonTitle={allLessons[selectedLesson.step]?.title}
              onAskAI={(context) => openAI(context)}
              onFocusChange={handleFocusChange}
              onCompleteAndContinue={(record) => {
                setLessonCodeRecords((current) => ({ ...current, [record.lessonId]: record }));
                if (!completed.includes(selectedLesson.id)) saveProgress([...completed, selectedLesson.id]);
                const following = allLessons[selectedLesson.step];
                if (following) enterLesson(following);
                else setView('roadmap');
              }}
            />}

            {lessonTab === 'ai' && <div className={styles.aiLanding}><Bot size={36} /><h2>現在のレッスンをGeminiに質問</h2><p>レッスン内容、重要ポイント、現在のコードを文脈として渡せます。</p><button onClick={() => openAI()}><Sparkles size={16} />AIチューターを開く</button></div>}

            {lessonTab === 'summary' && <div className={styles.summaryPage}><CheckCircle2 size={42} /><h2>{selectedLesson.title}のまとめ</h2><ul>{selectedLesson.review.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>{completed.includes(selectedLesson.id) ? <><span>このレッスンは完了済みです</span>{allLessons[selectedLesson.step] && <button onClick={() => openLesson(allLessons[selectedLesson.step])}>次の講義へ<ArrowRight size={15} /></button>}</> : <button onClick={() => { saveProgress([...completed, selectedLesson.id]); const following = allLessons[selectedLesson.step]; if (following) enterLesson(following); }}>完了して次の講義へ</button>}</div>}
          </div>
        )}

        {view === 'practice' && <PracticeCenter mode="practice" data={learningData} onAnswer={recordAnswer} onToggleFavorite={(id) => toggleListItem('favorites', id)} onToggleReview={(id) => toggleListItem('reviewList', id)} onAskAI={openAI} />}
        {view === 'review' && <PracticeCenter mode="review" data={learningData} onAnswer={recordAnswer} onToggleFavorite={(id) => toggleListItem('favorites', id)} onToggleReview={(id) => toggleListItem('reviewList', id)} onAskAI={openAI} />}
        {view === 'analytics' && <PracticeCenter mode="analytics" data={learningData} onAnswer={recordAnswer} onToggleFavorite={(id) => toggleListItem('favorites', id)} onToggleReview={(id) => toggleListItem('reviewList', id)} onAskAI={openAI} />}
        {view === 'exam' && <ExamCenter data={learningData} onComplete={completeExam} onAddReviews={(ids) => updateLearningData((current) => ({ ...current, reviewList: [...new Set([...current.reviewList, ...ids])] }))} onAskAI={openAI} />}
        {view === 'projects' && <ProjectLab progress={learningData.projectProgress} customProjects={learningData.customProjects} onSave={saveProjectProgress} onSaveProject={saveCustomProject} onDeleteProject={deleteCustomProject} onAskAI={openAI} onSubmitPortfolio={(project, code) => { setPortfolioDraft({ project, code }); setView('portfolio'); }} />}
        {view === 'portfolio' && <PortfolioStudio key={portfolioDraft ? `${portfolioDraft.project.id}-${portfolioDraft.code.length}` : 'empty-portfolio'} submissions={learningData.portfolioSubmissions} draft={portfolioDraft} onSave={savePortfolioSubmission} onDelete={deletePortfolioSubmission} />}
        {view === 'planner' && <StudyPlanner plans={learningData.studyPlans} weaknesses={weakCategoryNames} onSave={saveStudyPlan} onToggleDay={togglePlanDay} onDelete={(id) => updateLearningData((current) => ({ ...current, studyPlans: current.studyPlans.filter((plan) => plan.id !== id) }))} />}
        {view === 'creator' && <CourseCreator savedLessons={customLessons} onSave={saveCustomLesson} onOpen={openLesson} onDelete={deleteCustomLesson} onUpdate={updateCustomLesson} onDuplicate={duplicateCustomLesson} onMove={moveCustomLesson} onImport={importCustomLessons} />}
        {view === 'resources' && <ResourceCenter data={learningData} customLessons={customLessons} completed={completed} studyDates={studyDates} lessonCodeRecords={lessonCodeRecords} onRestore={restoreBackup} />}

        {view === 'settings' && <div className={styles.settingsPage}><section className={styles.pageHero}><small>SETTINGS & DATA</small><h1>設定</h1><p>学習履歴、講義ごとのコード、AI講座、Gemini APIキー、選択モデルはこのブラウザのlocalStorageへ保存されます。</p></section><article className={styles.dataSettingsCard}><Settings size={24} /><h2>保存データ</h2><div><span><strong>{completed.length}</strong>完了レッスン</span><span><strong>{learningData.attempts.length}</strong>問題回答</span><span><strong>{customLessons.length}</strong>AI講座</span></div><button onClick={() => { if (window.confirm('学習履歴と保存コードを初期化しますか？')) { setCompleted([]); setStudyDates([]); setLessonCodeRecords({}); setLearningData(initialLearningData); saveLearningData(initialLearningData); localStorage.removeItem('ts-pass-lab-progress'); localStorage.removeItem(LESSON_CODE_KEY); } }}><RotateCcw size={15} />学習履歴を初期化</button></article><GeminiSettings /></div>}
      </main>

      {!focusMode && <nav className={styles.bottomNav}>{navItems.map((item) => <button key={item.id} className={view === item.id ? styles.activeBottom : ''} onClick={() => setView(item.id)}><item.icon size={18} />{item.short}</button>)}<button onClick={() => openAI()}><Bot size={18} />AI</button></nav>}
      <AITutorDrawer key={`${aiContext.slice(0, 40)}-${aiSuggestedPrompt}`} open={aiOpen && !focusMode} onClose={() => { setAiOpen(false); setAiSuggestedPrompt(''); }} context={aiContext} suggestedPrompt={aiSuggestedPrompt} />
      {reattendLesson && <div className={styles.reattendBackdrop}>
        <section className={styles.reattendDialog}>
          <header><div><small>RELEARN LESSON</small><h2>「{reattendLesson.title}」を再受講</h2></div><button aria-label="閉じる" onClick={() => setReattendLesson(null)}><X size={17} /></button></header>
          <p>前回のコードが保存されています。続きから確認するか、初期コードへ戻して最初から解き直すかを選べます。</p>
          <div>
            <button onClick={() => { const target = reattendLesson; setReattendLesson(null); enterLesson(target, 'exercise'); }}><Save size={16} />保存コードで再開</button>
            <button onClick={() => {
              const target = reattendLesson;
              removeLessonCodeRecord(target.id);
              setLessonCodeRecords((current) => {
                const next = { ...current };
                delete next[target.id];
                return next;
              });
              setReattendLesson(null);
              enterLesson(target, 'exercise');
            }}><RotateCcw size={16} />リセットして再受講</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
