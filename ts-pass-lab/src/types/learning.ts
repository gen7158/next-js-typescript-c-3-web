export type LessonLevel = 'basic' | 'standard' | 'advanced';

export type LessonSection = {
  title: string;
  description: string;
  points: string[];
  code?: string;
};

export type CodeExample = {
  title: string;
  description: string;
  code: string;
  output: string;
};

export type KnowledgeCheck = {
  question: string;
  answer: string;
};

export type Exercise = {
  id: string;
  title: string;
  description: string;
  taskGoal?: string;
  inputSpec?: string;
  outputSpec?: string;
  successCriteria?: string[];
  requirements: string[];
  starterCode: string;
  solution: string;
  expectedOutput: string;
  hints: string[];
  guideSteps?: string[];
  examPoint: string;
};

export type LessonCodeRecord = {
  lessonId: string;
  code: string;
  output: string;
  diagnostics: string[];
  inferredTypes: { name: string; type: string; line: number }[];
  passed: boolean;
  updatedAt: string;
  completedAt: string | null;
};

export type Lesson = {
  id: string;
  step: number;
  title: string;
  chapter: string;
  category: string;
  level: LessonLevel;
  source?: 'built-in' | 'ai';
  minutes: number;
  summary: string;
  learningGoals: string[];
  whyImportant: string;
  pitfalls: string[];
  keyPoints: string[];
  syntax: string;
  code: string;
  output: string;
  lineByLine: string[];
  sections: LessonSection[];
  comparisons: string[];
  extraExamples: CodeExample[];
  checkpoints: KnowledgeCheck[];
  exercise: Exercise;
  review: string[];
};
