import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { StudyPlanDay } from '@/types/platform';

export const dynamic = 'force-dynamic';

type RequestBody = {
  goal?: string;
  targetDate?: string;
  dailyMinutes?: number;
  weaknesses?: string[];
  apiKey?: string;
  model?: string;
};

function fallbackDays(goal: string, count: number, dailyMinutes: number, weaknesses: string[]): StudyPlanDay[] {
  const topics = weaknesses.length
    ? [...weaknesses, 'TypeScript型安全', 'HTTPとWeb基礎', 'React UI', 'Next.js App Router', 'REST API', 'SQLとPrisma', '認証と認可', 'テスト', '総合制作と公開']
    : ['TypeScriptの基本', 'HTTP・HTML・CSS', 'Reactコンポーネント', 'React状態管理', 'Next.js App Router', 'Route HandlerとREST API', 'SQLとDB設計', 'Prisma CRUD', '認証・認可・セキュリティ', '自動テスト', 'デプロイと監視', '総合制作'];
  return Array.from({ length: count }, (_, index) => {
    const topic = topics[index % topics.length];
    const isReview = index > 0 && (index + 1) % 4 === 0;
    return {
      day: index + 1,
      title: isReview ? `${topic}の定着確認` : topic,
      tasks: isReview
        ? ['前回間違えた問題を3問解く', 'コード例を見ずに再現する', '理解できない点をAIへ質問する']
        : [`${topic}の講座を読む`, 'コード例を1回変更して実行する', '関連問題を5問解く'],
      minutes: dailyMinutes,
      completed: false,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;
    const goal = body.goal?.trim() || 'TypeScriptからデプロイまでのフルスタック基礎を身につける';
    const dailyMinutes = Math.min(180, Math.max(15, Number(body.dailyMinutes) || 30));
    const target = body.targetDate ? new Date(`${body.targetDate}T00:00:00`) : new Date(Date.now() + 14 * 86400000);
    const days = Math.min(60, Math.max(3, Math.ceil((target.getTime() - Date.now()) / 86400000)));
    const fallback = fallbackDays(goal, days, dailyMinutes, body.weaknesses || []);
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: true, days: fallback, isMock: true });

    const modelName = body.model?.trim() || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent([
      'TypeScriptとWebフルスタック開発の初心者向けに、現実的な日別学習計画を日本語で作ってください。',
      `目標: ${goal}`,
      `日数: ${days}`,
      `1日: ${dailyMinutes}分`,
      `苦手: ${(body.weaknesses || []).join('、') || '未分析'}`,
      'TypeScript、HTTP、HTML/CSS、React、Next.js、API、DB、認証、テスト、デプロイを、講座、コード変更、問題演習、間隔反復、制作課題に分けて含めます。',
      '次の配列と同じJSON形式だけを返してください。',
      JSON.stringify(fallback),
    ].join('\n\n'));
    const parsed = JSON.parse(result.response.text()) as StudyPlanDay[];
    const normalized = Array.isArray(parsed) && parsed.length
      ? parsed.slice(0, days).map((day, index) => ({
          day: index + 1,
          title: typeof day.title === 'string' ? day.title : fallback[index].title,
          tasks: Array.isArray(day.tasks) ? day.tasks.slice(0, 4) : fallback[index].tasks,
          minutes: dailyMinutes,
          completed: false,
        }))
      : fallback;
    return NextResponse.json({ success: true, days: normalized, isMock: false, model: modelName });
  } catch (error) {
    const message = error instanceof Error ? error.message : '学習計画を生成できませんでした。';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
