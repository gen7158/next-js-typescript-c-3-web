export type QuestionDifficulty = "basic" | "standard" | "exam";
export type QuestionType = "choice" | "fill" | "output" | "reading" | "trueFalse";

export type Question = {
  id: string;
  category: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  question: string;
  code?: string;
  choices?: string[];
  answer: string | number | boolean;
  explanation: string;
  choiceExplanations?: string[];
  examTip?: string;
};

export type QuestionAttempt = {
  questionId: string;
  category: string;
  answer: string | number | boolean;
  correct: boolean;
  answeredAt: string;
};
