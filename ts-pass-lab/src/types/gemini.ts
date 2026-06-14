export type GeminiModel = {
  name: string;
  displayName: string;
  description: string;
  version?: string;
  supportedMethods: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
};

export type GeminiModelCache = {
  models: GeminiModel[];
  updatedAt: string;
};
