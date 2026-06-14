import type { ExamAnswer } from "@/types/progress";
import type { QuestionAttempt } from "@/types/question";

export function calculateAccuracy(attempts: QuestionAttempt[]) {
  if (!attempts.length) return 0;
  return (attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100;
}

export function calculateCategoryAccuracy(attempts: QuestionAttempt[]) {
  const grouped = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const current = grouped.get(attempt.category) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (attempt.correct) current.correct += 1;
    grouped.set(attempt.category, current);
  }
  return Object.fromEntries(
    [...grouped.entries()].map(([category, value]) => [
      category,
      Math.round((value.correct / value.total) * 100),
    ]),
  );
}

export function calculateExamScore(answers: ExamAnswer[]) {
  const correct = answers.filter((answer) => answer.correct).length;
  const percentage = answers.length ? Math.round((correct / answers.length) * 100) : 0;
  return { correct, total: answers.length, percentage, passed: percentage >= 60 };
}

export function getPassProbability(accuracy: number, latestExamScore?: number) {
  const blended = latestExamScore === undefined ? accuracy : accuracy * 0.4 + latestExamScore * 0.6;
  if (blended >= 80) return { label: "合格圏", value: Math.min(95, Math.round(blended + 8)), tone: "success" as const };
  if (blended >= 60) return { label: "合格ライン付近", value: Math.round(blended), tone: "warning" as const };
  if (blended >= 35) return { label: "あと一歩", value: Math.round(blended * 0.85), tone: "warning" as const };
  return { label: "基礎固め中", value: Math.max(12, Math.round(blended * 0.7)), tone: "danger" as const };
}

export function extractWeakCategories(attempts: QuestionAttempt[], limit = 3) {
  const accuracies = calculateCategoryAccuracy(attempts);
  return Object.entries(accuracies)
    .filter(([, accuracy]) => accuracy < 70)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([category, accuracy]) => ({ category, accuracy }));
}

export function calculateReviewPriority(attempts: QuestionAttempt[]) {
  const scores = new Map<string, number>();
  attempts.forEach((attempt, index) => {
    const ageWeight = 1 + (attempts.length - index) / Math.max(1, attempts.length);
    const change = attempt.correct ? -0.5 : 2 * ageWeight;
    scores.set(attempt.questionId, (scores.get(attempt.questionId) ?? 0) + change);
  });
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([questionId]) => questionId);
}
