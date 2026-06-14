import { NextResponse } from 'next/server';
import type { GeminiModel } from '@/types/gemini';

export const dynamic = 'force-dynamic';

type RawModel = {
  name?: string;
  displayName?: string;
  description?: string;
  version?: string;
  supportedGenerationMethods?: string[];
  supportedActions?: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
};

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json() as { apiKey?: string };
    if (!apiKey?.trim()) {
      return NextResponse.json({ success: false, error: 'Gemini APIキーを入力してください。' }, { status: 400 });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', {
      headers: { 'x-goog-api-key': apiKey.trim() },
      cache: 'no-store',
    });
    const data = await response.json() as { models?: RawModel[]; error?: { message?: string } };

    if (!response.ok) {
      const hint = response.status === 400 || response.status === 401 || response.status === 403
        ? 'APIキーが正しいか、Gemini APIが有効か確認してください。'
        : response.status === 429
          ? 'リクエスト上限に達しました。少し待ってから更新してください。'
          : 'Gemini APIとの通信に失敗しました。';
      return NextResponse.json({ success: false, error: `${data.error?.message || hint} ${hint}` }, { status: response.status });
    }

    const models: GeminiModel[] = (data.models || []).flatMap((model) => {
      const methods = model.supportedGenerationMethods || model.supportedActions || [];
      if (!methods.includes('generateContent') || !model.name) return [];
      const name = model.name.replace(/^models\//, '');
      return [{
        name,
        displayName: model.displayName || name,
        description: model.description || '',
        version: model.version,
        supportedMethods: methods,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
      }];
    });

    return NextResponse.json({ success: true, models });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'モデル一覧を取得できませんでした。';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
