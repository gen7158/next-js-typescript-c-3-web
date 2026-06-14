import type { LearningState } from "@/types/progress";

export const STORAGE_KEY = "c-pass-lab-state-v1";

export const initialLearningState: LearningState = {
  completedLessons: [],
  completedAdvancedLessons: [],
  attempts: [],
  favoriteQuestionIds: [],
  reviewQuestionIds: [],
  examHistory: [],
  apiKey: "",
  selectedModel: "gemini-2.5-flash",
  modelsCache: [],
  modelsUpdatedAt: null,
  lastStudyDate: null,
  studyDates: [],
  lessonCodeRecords: {},
};

export function readLearningState(): LearningState {
  if (typeof window === "undefined") return initialLearningState;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return initialLearningState;
    const parsed = JSON.parse(value) as Partial<LearningState>;
    return {
      ...initialLearningState,
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedAdvancedLessons: Array.isArray(parsed.completedAdvancedLessons) ? parsed.completedAdvancedLessons : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      favoriteQuestionIds: Array.isArray(parsed.favoriteQuestionIds) ? parsed.favoriteQuestionIds : [],
      reviewQuestionIds: Array.isArray(parsed.reviewQuestionIds) ? parsed.reviewQuestionIds : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      modelsCache: Array.isArray(parsed.modelsCache) ? parsed.modelsCache : [],
      studyDates: Array.isArray(parsed.studyDates) ? parsed.studyDates : [],
      lessonCodeRecords: parsed.lessonCodeRecords && typeof parsed.lessonCodeRecords === "object"
        ? parsed.lessonCodeRecords
        : {},
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialLearningState;
  }
}

export function writeLearningState(state: LearningState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearLearningState() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
