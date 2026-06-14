import { ArrowDown, CheckCircle2, Coffee, Lightbulb, Sprout } from 'lucide-react';
import { buildBeginnerGuidance, getLearningStage } from '@/lib/lesson-guidance';
import type { Lesson } from '@/types/learning';
import styles from './BeginnerGuide.module.css';

export default function BeginnerGuide({ lesson }: { lesson: Lesson }) {
  const guide = buildBeginnerGuidance(lesson);
  const stage = getLearningStage(lesson.step);

  return (
    <section className={styles.guide}>
      <header>
        <span><Sprout size={16} />{stage.label}</span>
        <div><strong>{stage.title}</strong><p>{stage.description}</p></div>
      </header>
      <div className={styles.grid}>
        <article><Lightbulb size={20} /><small>まず30秒で</small><h2>ひとことで言うと</h2><p>{guide.oneLine}</p></article>
        <article><Coffee size={20} /><small>身近なたとえ</small><h2>こう考えると簡単</h2><p>{guide.analogy}</p></article>
      </div>
      <article className={styles.steps}>
        <div><ArrowDown size={20} /><small>この順番なら迷わない</small><h2>今日の3ステップ</h2></div>
        <ol>{guide.steps.map((step) => <li key={step}><CheckCircle2 size={15} />{step}</li>)}</ol>
      </article>
      <p className={styles.later}><strong>今は覚えなくてOK:</strong> {guide.later}</p>
    </section>
  );
}
