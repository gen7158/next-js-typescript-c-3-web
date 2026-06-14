import type { GeminiModel } from "@/types/gemini";
import type { QuestionAttempt } from "@/types/question";

export type ExamAnswer = {
  questionId: string;
  correct: boolean;
  category: string;
};

export type ExamHistory = {
  id: string;
  takenAt: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  answers: ExamAnswer[];
};

export type LessonCodeRecord = {
  lessonId: string;
  code: string;
  output: string;
  compilerOutput: string;
  passed: boolean;
  updatedAt: string;
  completedAt: string | null;
};

export type LearningState = {
  completedLessons: string[];
  completedAdvancedLessons: string[];
  attempts: QuestionAttempt[];
  favoriteQuestionIds: string[];
  reviewQuestionIds: string[];
  examHistory: ExamHistory[];
  apiKey: string;
  selectedModel: string;
  modelsCache: GeminiModel[];
  modelsUpdatedAt: string | null;
  lastStudyDate: string | null;
  studyDates: string[];
  lessonCodeRecords: Record<string, LessonCodeRecord>;
};
