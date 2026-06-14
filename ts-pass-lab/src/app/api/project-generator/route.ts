import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { ProjectChallenge, QuestionDifficulty } from '@/types/platform';

export const dynamic = 'force-dynamic';

type GeneratorRequest = {
  topic?: string;
  goal?: string;
  level?: QuestionDifficulty;
  minutes?: number;
  apiKey?: string;
  model?: string;
};

function fallbackProject(topic: string, goal: string, level: QuestionDifficulty, minutes: number): ProjectChallenge {
  const safeTopic = topic.trim() || '学習記録';
  const safeGoal = goal.trim() || `${safeTopic}を型安全に管理して結果を表示する`;
  const escapedTopic = safeTopic.replaceAll('"', '\\"');
  const output = `${safeTopic}: 完成`;
  const solution = [
    'type ProjectResult = {',
    '  title: string;',
    '  completed: boolean;',
    '};',
    '',
    `const result: ProjectResult = { title: "${escapedTopic}", completed: true };`,
    'const status = result.completed ? "完成" : "作業中";',
    'console.log(`${result.title}: ${status}`);',
  ].join('\n');

  return {
    id: `ai-project-${Date.now()}`,
    source: 'ai',
    title: `${safeTopic}制作チャレンジ`,
    level,
    minutes,
    summary: `${safeGoal}ことを目標に、型設計から出力確認まで段階的に実装します。`,
    skills: [safeTopic, '型設計', '関数', '出力テスト'],
    requirements: [
      '扱うデータの型を定義する',
      '処理を1つ以上の変数または関数へ分ける',
      `「${output}」を出力する`,
    ],
    steps: [
      { title: 'データを設計する', description: '必要な値とそれぞれの型を決めます。', hint: '最初にtypeまたはinterfaceを書きます。' },
      { title: '処理を実装する', description: safeGoal, hint: '入力、処理、出力の3つに分けて考えます。' },
      { title: '出力を検証する', description: '期待する文字列と一致するか確認します。', hint: `console.logで「${output}」を表示します。` },
    ],
    starterCode: [
      '// 1. データの型を定義してください',
      '',
      `const title = "${escapedTopic}";`,
      '',
      '// 2. completedをboolean型で用意してください',
      '',
      '// 3. 期待する出力を表示してください',
    ].join('\n'),
    solution,
    expectedOutput: output,
  };
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function stringList(value: unknown, fallback: string[], limit: number) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, limit)
    : fallback;
}

function normalizeProject(value: Partial<ProjectChallenge>, fallback: ProjectChallenge): ProjectChallenge {
  const steps = Array.isArray(value.steps)
    ? value.steps.slice(0, 6).map((step, index) => ({
        title: text(step?.title, fallback.steps[index]?.title || `ステップ${index + 1}`),
        description: text(step?.description, fallback.steps[index]?.description || '課題を実装します。'),
        hint: text(step?.hint, fallback.steps[index]?.hint || '小さく分けて確認します。'),
      }))
    : fallback.steps;

  return {
    id: `ai-project-${Date.now()}`,
    source: 'ai',
    title: text(value.title, fallback.title),
    level: value.level === 'basic' || value.level === 'standard' || value.level === 'advanced' ? value.level : fallback.level,
    minutes: Math.min(180, Math.max(20, Number(value.minutes) || fallback.minutes)),
    summary: text(value.summary, fallback.summary),
    skills: stringList(value.skills, fallback.skills, 8),
    requirements: stringList(value.requirements, fallback.requirements, 8),
    steps: steps.length ? steps : fallback.steps,
    starterCode: text(value.starterCode, fallback.starterCode),
    solution: text(value.solution, fallback.solution),
    expectedOutput: text(value.expectedOutput, fallback.expectedOutput),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GeneratorRequest;
    const topic = body.topic?.trim() || '';
    const goal = body.goal?.trim() || '';
    const level = body.level || 'standard';
    const minutes = Math.min(180, Math.max(20, Number(body.minutes) || 60));
    if (topic.length < 2) {
      return NextResponse.json({ success: false, error: '作りたい課題テーマを2文字以上で入力してください。' }, { status: 400 });
    }

    const fallback = fallbackProject(topic, goal, level, minutes);
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: true, project: fallback, isMock: true });

    const modelName = body.model?.trim() || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent([
      'あなたはTypeScriptとWebフルスタック開発の初心者向け制作課題を設計するメンターです。',
      'React、Next.js、REST API、DB、認証などの題材を、学習者がブラウザ内で1ファイルのTypeScriptとして動作ロジックを練習できる課題に置き換えてください。',
      'starterCodeには未完成部分を残し、solutionはTypeScriptとして型エラーなく実行でき、console.logの全文がexpectedOutputと完全一致するようにしてください。',
      '画面、API、DBが必要な題材では、それぞれの責務を関数や配列で模擬してください。外部API、DOM、npmパッケージ、ファイル操作は使わず、標準JavaScriptだけで完結させてください。',
      `テーマ: ${topic}`,
      `達成目標: ${goal || `${topic}を型安全に実装する`}`,
      `難易度: ${level}`,
      `目安時間: ${minutes}分`,
      '次のProjectChallengeと同じキーを持つJSONだけを返してください。idとsourceは省略可能です。',
      JSON.stringify(fallback),
    ].join('\n\n'));
    const parsed = JSON.parse(result.response.text()) as Partial<ProjectChallenge>;
    return NextResponse.json({ success: true, project: normalizeProject(parsed, fallback), isMock: false, model: modelName });
  } catch (error) {
    const message = error instanceof Error ? error.message : '制作課題を生成できませんでした。';
    return NextResponse.json({ success: false, error: `AI制作課題の生成に失敗しました: ${message}` }, { status: 500 });
  }
}
