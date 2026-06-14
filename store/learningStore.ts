"use client";

import { create } from "zustand";
import { initialLearningState, readLearningState, writeLearningState } from "@/lib/storage";
import type { GeminiModel } from "@/types/gemini";
import type { ExamHistory, LearningState, LessonCodeRecord } from "@/types/progress";
import type { QuestionAttempt } from "@/types/question";

type LearningActions = {
  hydrated: boolean;
  hydrate: () => void;
  completeLesson: (id: string) => void;
  completeAdvancedLesson: (id: string) => void;
  recordAttempt: (attempt: QuestionAttempt) => void;
  toggleFavorite: (id: string) => void;
  toggleReview: (id: string) => void;
  addReviewItems: (ids: string[]) => void;
  addExamHistory: (exam: ExamHistory) => void;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  setModels: (models: GeminiModel[]) => void;
  saveLessonCode: (record: LessonCodeRecord) => void;
  resetLessonCode: (lessonId: string) => void;
  reset: () => void;
};

type Store = LearningState & LearningActions;

function stateOnly(store: Store): LearningState {
  return {
    completedLessons: store.completedLessons,
    completedAdvancedLessons: store.completedAdvancedLessons,
    attempts: store.attempts,
    favoriteQuestionIds: store.favoriteQuestionIds,
    reviewQuestionIds: store.reviewQuestionIds,
    examHistory: store.examHistory,
    apiKey: store.apiKey,
    selectedModel: store.selectedModel,
    modelsCache: store.modelsCache,
    modelsUpdatedAt: store.modelsUpdatedAt,
    lastStudyDate: store.lastStudyDate,
    studyDates: store.studyDates,
    lessonCodeRecords: store.lessonCodeRecords,
  };
}

export const useLearningStore = create<Store>((set, get) => {
  const persist = () => writeLearningState(stateOnly(get()));
  const today = () => new Date().toISOString().slice(0, 10);
  const markStudy = () => {
    const date = today();
    const dates = get().studyDates.includes(date) ? get().studyDates : [...get().studyDates, date];
    return { lastStudyDate: date, studyDates: dates };
  };

  return {
    ...initialLearningState,
    hydrated: false,
    hydrate: () => set({ ...readLearningState(), hydrated: true }),
    completeLesson: (id) => {
      set({
        completedLessons: get().completedLessons.includes(id) ? get().completedLessons : [...get().completedLessons, id],
        ...markStudy(),
      });
      persist();
    },
    completeAdvancedLesson: (id) => {
      set({
        completedAdvancedLessons: get().completedAdvancedLessons.includes(id)
          ? get().completedAdvancedLessons
          : [...get().completedAdvancedLessons, id],
        ...markStudy(),
      });
      persist();
    },
    recordAttempt: (attempt) => {
      set({ attempts: [...get().attempts, attempt], ...markStudy() });
      persist();
    },
    toggleFavorite: (id) => {
      const current = get().favoriteQuestionIds;
      set({ favoriteQuestionIds: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
      persist();
    },
    toggleReview: (id) => {
      const current = get().reviewQuestionIds;
      set({ reviewQuestionIds: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
      persist();
    },
    addReviewItems: (ids) => {
      set({ reviewQuestionIds: [...new Set([...get().reviewQuestionIds, ...ids])] });
      persist();
    },
    addExamHistory: (exam) => {
      set({ examHistory: [...get().examHistory, exam], ...markStudy() });
      persist();
    },
    setApiKey: (apiKey) => {
      set({ apiKey });
      persist();
    },
    setSelectedModel: (selectedModel) => {
      set({ selectedModel });
      persist();
    },
    setModels: (modelsCache) => {
      set({ modelsCache, modelsUpdatedAt: new Date().toISOString() });
      persist();
    },
    saveLessonCode: (record) => {
      set({ lessonCodeRecords: { ...get().lessonCodeRecords, [record.lessonId]: record } });
      persist();
    },
    resetLessonCode: (lessonId) => {
      const next = { ...get().lessonCodeRecords };
      delete next[lessonId];
      set({ lessonCodeRecords: next });
      persist();
    },
    reset: () => {
      set({ ...initialLearningState, hydrated: true });
      writeLearningState(initialLearningState);
    },
  };
});
