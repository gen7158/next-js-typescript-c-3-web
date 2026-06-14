import type { GeminiModel, GeminiModelCache } from '@/types/gemini';

export const GEMINI_STORAGE = {
  apiKey: 'ts-pass-lab-gemini-api-key',
  selectedModel: 'ts-pass-lab-gemini-model',
  modelCache: 'ts-pass-lab-gemini-model-cache',
} as const;

export function getGeminiApiKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_STORAGE.apiKey) || '';
}

export function getSelectedGeminiModel() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_STORAGE.selectedModel) || '';
}

export function getGeminiModelCache(): GeminiModelCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(GEMINI_STORAGE.modelCache);
    if (!value) return null;
    const parsed = JSON.parse(value) as GeminiModelCache;
    return Array.isArray(parsed.models) && typeof parsed.updatedAt === 'string' ? parsed : null;
  } catch {
    localStorage.removeItem(GEMINI_STORAGE.modelCache);
    return null;
  }
}

function modelScore(model: GeminiModel) {
  const name = model.name.toLowerCase();
  let score = 0;
  if (name === 'gemini-3.5-flash') score += 10000;
  else if (name.includes('gemini-3.5-flash')) score += 9000;
  else if (name.includes('gemini-3.1-pro')) score += 8000;
  else if (name.includes('gemini-3.1-flash')) score += 7600;
  else if (name.includes('gemini-3-flash')) score += 7200;
  else if (name.includes('gemini-3')) score += 6800;
  else if (name.includes('gemini-2.5-flash')) score += 6000;
  else if (name.includes('gemini-2.5-pro')) score += 5500;
  else if (name.includes('gemini-2.5')) score += 5000;
  if (!name.includes('preview') && !name.includes('experimental') && !name.includes('exp')) score += 500;
  if (name.includes('latest')) score -= 100;
  if (name.includes('lite')) score -= 150;
  if (name.includes('image') || name.includes('tts') || name.includes('live') || name.includes('audio')) score -= 5000;
  return score;
}

export function selectRecommendedGeminiModel(models: GeminiModel[]) {
  return [...models].sort((a, b) => modelScore(b) - modelScore(a))[0]?.name || 'gemini-3.5-flash';
}

export function isRecommendedGeminiModel(model: GeminiModel, models: GeminiModel[]) {
  return model.name === selectRecommendedGeminiModel(models);
}
