export type LessonLevel = "basic" | "standard" | "exam" | "advanced";

export type CodeExample = {
  title: string;
  description: string;
  code: string;
  output?: string;
  explanation: string;
  lineByLine?: string[];
};

export type LessonSection = {
  title: string;
  body: string;
  code?: string;
};

export type Exercise = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  stdin?: string;
  expectedOutput?: string;
  requirements: string[];
  hints: string[];
  guideSteps?: string[];
  solution: string;
  explanation: string;
  examPoint: string;
};

export type Lesson = {
  id: string;
  title: string;
  category: string;
  level: LessonLevel;
  estimatedMinutes: number;
  summary: string;
  learningGoals: string[];
  whyImportant: string;
  beginnerPitfalls: string[];
  examPattern: string;
  keyPoints: string[];
  todayGoal: string;
  contentSections: LessonSection[];
  exercises: Exercise[];
  summaryPoints: string[];
  whyItMatters: string;
  content: string;
  codeExamples: CodeExample[];
  commonMistakes: string[];
  examPoints: string[];
  miniQuizIds: string[];
  questionCount: number;
};
