import { lessons } from "@/data/lessons";
import { advancedLessons } from "@/data/advanced-lessons";
import type { LearningState } from "@/types/progress";

export function getCertificationStatus(state: Pick<LearningState, "completedLessons" | "examHistory">) {
  const completedCore = lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const lessonPercentage = lessons.length ? Math.round((completedCore / lessons.length) * 100) : 0;
  const bestExam = state.examHistory.reduce((best, exam) => Math.max(best, exam.percentage), 0);
  const lessonsReady = completedCore === lessons.length;
  const examReady = bestExam >= 60;

  return {
    completedCore,
    totalCore: lessons.length,
    lessonPercentage,
    bestExam,
    lessonsReady,
    examReady,
    advancedUnlocked: lessonsReady && examReady,
  };
}

export function getAdvancedLessonAccess(
  lessonId: string,
  completedAdvancedLessons: string[],
) {
  const index = advancedLessons.findIndex((lesson) => lesson.id === lessonId);
  const previous = index > 0 ? advancedLessons[index - 1] : undefined;
  return {
    index,
    previous,
    sequenceReady: !previous || completedAdvancedLessons.includes(previous.id),
  };
}
