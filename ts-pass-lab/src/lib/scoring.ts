import type { LearningData, Question, QuestionAttempt } from '@/types/platform';

export function categoryAccuracy(attempts: QuestionAttempt[]) {
  const totals: Record<string, { correct: number; total: number; percentage: number }> = {};
  attempts.forEach((attempt) => {
    const current = totals[attempt.category] || { correct: 0, total: 0, percentage: 0 };
    current.total += 1;
    if (attempt.correct) current.correct += 1;
    current.percentage = Math.round((current.correct / current.total) * 100);
    totals[attempt.category] = current;
  });
  return totals;
}

export function weakestCategories(attempts: QuestionAttempt[], limit = 4) {
  return Object.entries(categoryAccuracy(attempts))
    .filter(([, value]) => value.total >= 1)
    .sort((a, b) => a[1].percentage - b[1].percentage || b[1].total - a[1].total)
    .slice(0, limit);
}

export function dueReviewIds(data: LearningData) {
  const now = Date.now();
  const latest = new Map<string, QuestionAttempt>();
  data.attempts.forEach((attempt) => latest.set(attempt.questionId, attempt));
  const scheduled = [...latest.values()]
    .filter((attempt) => !attempt.correct || new Date(attempt.nextReviewAt).getTime() <= now)
    .map((attempt) => attempt.questionId);
  return [...new Set([...data.reviewList, ...scheduled])];
}

export function buildExamQuestions(questions: Question[], count = 20) {
  const categories = [...new Set(questions.map((question) => question.category))];
  for (let index = categories.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [categories[index], categories[target]] = [categories[target], categories[index]];
  }
  const selected: Question[] = [];
  categories.forEach((category) => {
    const pool = questions.filter((question) => question.category === category);
    if (pool.length) selected.push(pool[Math.floor(Math.random() * pool.length)]);
  });
  const remaining = questions.filter((question) => !selected.some((item) => item.id === question.id));
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [remaining[index], remaining[target]] = [remaining[target], remaining[index]];
  }
  return [...selected, ...remaining].slice(0, count);
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / 250) + 1;
}
