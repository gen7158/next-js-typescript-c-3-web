export type QuestionDifficulty = 'basic' | 'standard' | 'advanced';
export type QuestionType = 'choice' | 'output' | 'reading' | 'trueFalse' | 'fill';

export type Question = {
  id: string;
  category: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  code?: string;
  choices: string[];
  answer: number;
  explanation: string;
  wrongReasons: string[];
  examPoint: string;
};

export type QuestionAttempt = {
  questionId: string;
  category: string;
  correct: boolean;
  answeredAt: string;
  selectedAnswer: number;
  reviewStage: number;
  nextReviewAt: string;
};

export type ExamResult = {
  id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  categoryScores: Record<string, { correct: number; total: number }>;
  wrongQuestionIds: string[];
  completedAt: string;
};

export type StudyPlanDay = {
  day: number;
  title: string;
  tasks: string[];
  minutes: number;
  completed: boolean;
};

export type StudyPlan = {
  id: string;
  goal: string;
  targetDate: string;
  dailyMinutes: number;
  createdAt: string;
  days: StudyPlanDay[];
};

export type ProjectProgress = {
  projectId: string;
  completedSteps: number[];
  code: string;
  updatedAt: string;
};

export type PortfolioScore = {
  functionality: number;
  typeSafety: number;
  backend: number;
  security: number;
  testing: number;
  documentation: number;
  total: number;
};

export type PortfolioSubmission = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  code: string;
  repositoryUrl: string;
  demoUrl: string;
  score: PortfolioScore;
  aiReview: string;
  submittedAt: string;
};

export type LearningData = {
  attempts: QuestionAttempt[];
  favorites: string[];
  reviewList: string[];
  examHistory: ExamResult[];
  studyPlans: StudyPlan[];
  projectProgress: ProjectProgress[];
  customProjects: ProjectChallenge[];
  portfolioSubmissions: PortfolioSubmission[];
  xp: number;
};

export type ProjectChallenge = {
  id: string;
  title: string;
  source?: 'built-in' | 'ai';
  level: QuestionDifficulty;
  minutes: number;
  summary: string;
  skills: string[];
  requirements: string[];
  steps: { title: string; description: string; hint: string }[];
  starterCode: string;
  solution: string;
  expectedOutput: string;
};

export type GlossaryTerm = {
  term: string;
  reading: string;
  category: string;
  description: string;
  example: string;
};
