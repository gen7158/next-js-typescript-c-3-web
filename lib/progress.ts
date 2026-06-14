import { lessons } from "@/data/lessons";
import { questions } from "@/data/questions";
import { calculateCategoryAccuracy, extractWeakCategories } from "@/lib/scoring";
import type { LearningState } from "@/types/progress";

export function calculateLessonProgress(completedLessons: string[]) {
  return lessons.length ? (completedLessons.length / lessons.length) * 100 : 0;
}

export function calculateOverallProgress(state: LearningState) {
  const lessonPart = calculateLessonProgress(state.completedLessons) * 0.55;
  const solvedUnique = new Set(state.attempts.map((attempt) => attempt.questionId)).size;
  const practicePart = (solvedUnique / questions.length) * 100 * 0.3;
  const examPart = Math.min(state.examHistory.length / 3, 1) * 100 * 0.15;
  return Math.min(100, Math.round(lessonPart + practicePart + examPart));
}

export function calculateStudyStreak(studyDates: string[]) {
  const dates = [...new Set(studyDates)].sort().reverse();
  if (!dates.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latest = new Date(`${dates[0]}T00:00:00`);
  const gap = Math.round((today.getTime() - latest.getTime()) / 86_400_000);
  if (gap > 1) return 0;
  let streak = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00`);
    const current = new Date(`${dates[index]}T00:00:00`);
    if (Math.round((previous.getTime() - current.getTime()) / 86_400_000) !== 1) break;
    streak += 1;
  }
  return streak;
}

export function getTodayRecommendation(state: LearningState) {
  const weak = extractWeakCategories(state.attempts, 1)[0];
  if (weak) {
    const lesson = lessons.find((item) => item.category === weak.category);
    return {
      title: `${weak.category}を復習`,
      description: `正答率${weak.accuracy}%の分野です。例題を見直してから5問解きましょう。`,
      href: lesson ? `/learn/${lesson.id}` : "/practice",
    };
  }
  const nextLesson = lessons.find((lesson) => !state.completedLessons.includes(lesson.id));
  if (nextLesson) {
    return {
      title: nextLesson.title,
      description: `${nextLesson.estimatedMinutes}分で基礎を一つ進めましょう。`,
      href: `/learn/${nextLesson.id}`,
    };
  }
  return { title: "ランダム10問", description: "知識を忘れないように総合演習をしましょう。", href: "/practice?mode=random" };
}

export function getNextCategories(state: LearningState, limit = 3) {
  const categoryAccuracy = calculateCategoryAccuracy(state.attempts);
  return lessons
    .filter((lesson) => !state.completedLessons.includes(lesson.id) || (categoryAccuracy[lesson.category] ?? 100) < 70)
    .sort((a, b) => (categoryAccuracy[a.category] ?? 101) - (categoryAccuracy[b.category] ?? 101))
    .slice(0, limit);
}
