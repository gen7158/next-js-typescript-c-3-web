export type GeminiMode = "simple" | "detailed" | "exam" | "debug" | "socratic" | "review";

export type GeminiHistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

export type GeminiModel = {
  name: string;
  displayName?: string;
  supportedGenerationMethods: string[];
  recommended?: boolean;
};

export type GeminiRequest = {
  prompt: string;
  mode: GeminiMode;
  context?: string;
  model?: string;
  history?: GeminiHistoryMessage[];
};

export type GeminiResponse = {
  text: string;
  model: string;
};
