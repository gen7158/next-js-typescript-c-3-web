import type { LessonCodeRecord } from '@/types/learning';
import type { LearningData, QuestionAttempt } from '@/types/platform';

export const LEARNING_DATA_KEY = 'ts-pass-lab-learning-data-v2';
export const LESSON_CODE_KEY = 'ts-pass-lab-lesson-code-v1';

export const initialLearningData: LearningData = {
  attempts: [],
  favorites: [],
  reviewList: [],
  examHistory: [],
  studyPlans: [],
  projectProgress: [],
  customProjects: [],
  portfolioSubmissions: [],
  xp: 0,
};

export function loadLearningData(): LearningData {
  if (typeof window === 'undefined') return initialLearningData;
  try {
    const raw = localStorage.getItem(LEARNING_DATA_KEY);
    if (!raw) return initialLearningData;
    const value = JSON.parse(raw) as Partial<LearningData>;
    return {
      attempts: Array.isArray(value.attempts) ? value.attempts : [],
      favorites: Array.isArray(value.favorites) ? value.favorites : [],
      reviewList: Array.isArray(value.reviewList) ? value.reviewList : [],
      examHistory: Array.isArray(value.examHistory) ? value.examHistory : [],
      studyPlans: Array.isArray(value.studyPlans) ? value.studyPlans : [],
      projectProgress: Array.isArray(value.projectProgress) ? value.projectProgress : [],
      customProjects: Array.isArray(value.customProjects) ? value.customProjects : [],
      portfolioSubmissions: Array.isArray(value.portfolioSubmissions) ? value.portfolioSubmissions : [],
      xp: typeof value.xp === 'number' ? value.xp : 0,
    };
  } catch {
    localStorage.removeItem(LEARNING_DATA_KEY);
    return initialLearningData;
  }
}

export function saveLearningData(data: LearningData) {
  localStorage.setItem(LEARNING_DATA_KEY, JSON.stringify(data));
}

export function loadLessonCodeRecords(): Record<string, LessonCodeRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LESSON_CODE_KEY);
    if (!raw) return {};
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, LessonCodeRecord>
      : {};
  } catch {
    localStorage.removeItem(LESSON_CODE_KEY);
    return {};
  }
}

export function saveLessonCodeRecord(record: LessonCodeRecord) {
  const records = loadLessonCodeRecords();
  records[record.lessonId] = record;
  localStorage.setItem(LESSON_CODE_KEY, JSON.stringify(records));
}

export function removeLessonCodeRecord(lessonId: string) {
  const records = loadLessonCodeRecords();
  delete records[lessonId];
  localStorage.setItem(LESSON_CODE_KEY, JSON.stringify(records));
}

export function createAttempt(
  questionId: string,
  category: string,
  correct: boolean,
  selectedAnswer: number,
  previousAttempts: QuestionAttempt[],
): QuestionAttempt {
  const previous = [...previousAttempts].reverse().find((attempt) => attempt.questionId === questionId);
  const nextStage = correct ? Math.min((previous?.reviewStage || 0) + 1, 3) : 0;
  const reviewDays = [1, 3, 7, 14];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + reviewDays[nextStage]);
  return {
    questionId,
    category,
    correct,
    selectedAnswer,
    answeredAt: new Date().toISOString(),
    reviewStage: nextStage,
    nextReviewAt: nextReview.toISOString(),
  };
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
