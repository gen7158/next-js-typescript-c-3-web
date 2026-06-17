import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { Lesson, LessonLevel } from '@/types/learning';

export const dynamic = 'force-dynamic';

type GeneratorRequest = {
  topic?: string;
  level?: LessonLevel;
  goal?: string;
  minutes?: number;
  apiKey?: string;
  model?: string;
};

function createFallbackLesson(topic: string, level: LessonLevel, goal: string, minutes: number): Lesson {
  const safeTopic = topic.trim() || '型安全なWeb API';
  const safeGoal = goal.trim() || `${safeTopic}を自分のコードで使えるようになる`;
  const variableName = safeTopic.toLowerCase().includes('react') ? 'componentName' : 'learningTopic';
  const code = `const ${variableName}: string = "${safeTopic.replaceAll('"', '\\"')}";\nconst completed: boolean = true;\nconsole.log(\`\${${variableName}}: \${completed}\`);`;
  const output = `${safeTopic}: true`;

  return {
    id: `ai-${Date.now()}`,
    step: 0,
    title: `${safeTopic} 実践講座`,
    chapter: 'AIカスタム講座',
    category: 'AI生成',
    level,
    source: 'ai',
    minutes,
    summary: `${safeTopic}を、概念理解・コード読解・演習の順番で学ぶカスタム講座です。`,
    learningGoals: [
      `${safeTopic}の役割を初心者向けの言葉で説明できる`,
      `${safeTopic}を使った短いコードを読める`,
      '型エラーと実行結果を分けて確認できる',
      safeGoal,
    ],
    whyImportant: `${safeTopic}は、TypeScriptの知識を実際のWebアプリへつなげるために重要です。この講座では答えを暗記せず、入力、型、処理、保存、出力を一つずつ確認します。`,
    pitfalls: [
      'サンプルコードをそのまま写し、各行の役割を確認しない',
      '型エラーと実行時エラーを同じものとして考える',
      '一度に多くの機能を追加して原因を追えなくする',
    ],
    keyPoints: [safeTopic, '型注釈', '型推論', 'コード読解'],
    syntax: `const ${variableName}: string = "${safeTopic.replaceAll('"', '\\"')}";`,
    code,
    output,
    lineByLine: [
      `学習テーマ「${safeTopic}」を文字列として保存します。`,
      '課題を完了した状態をboolean型で表します。',
      'テーマ名と完了状態をテンプレート文字列で表示します。',
    ],
    sections: [
      {
        title: '概念をつかむ',
        description: `${safeTopic}を学ぶときは、最初に「どの問題を解決する機能か」「入力と出力は何か」を整理します。`,
        points: ['目的を一文で説明する', '扱う値の型を書き出す', '最小のコードで結果を確認する'],
      },
      {
        title: 'コードへ落とし込む',
        description: `目標は「${safeGoal}」です。サンプルを実行したあと、変数名や値を変更して理解を確かめます。`,
        points: ['1行ずつ値の変化を追う', '変更前に出力を予想する', 'エラー文の型名を確認する'],
        code,
      },
    ],
    comparisons: [
      '型注釈は開発者が意図を明示し、型推論は値からTypeScriptが型を判断します。',
      'コードを写すだけの学習より、変更と予測を繰り返す方が別の問題でも知識を使いやすくなります。',
    ],
    extraExamples: [
      {
        title: '値を変更して確認',
        description: 'テーマ名や完了状態を変え、出力がどう変わるか確認します。',
        code,
        output,
      },
    ],
    checkpoints: [
      { question: `${safeTopic}を学ぶ目的を一文で説明できますか？`, answer: safeGoal },
      { question: 'コードを実行する前に何を確認しますか？', answer: '各変数の型、処理の順番、予想される出力を確認します。' },
    ],
    exercise: {
      id: `ai-${Date.now()}-exercise`,
      title: `${safeTopic}のミニ課題`,
      description: `${safeGoal}ための最小コードを完成させてください。`,
      taskGoal: `この演習では「${safeGoal}」ために、${safeTopic}を表す変数と完了状態を作り、console.logで確認するコードを書きます。`,
      inputSpec: `固定値として「${safeTopic}」とtrueを使います。外部入力は使わず、まず型付き変数を自分で宣言します。`,
      outputSpec: `最後に「${output}」を表示します。これはテーマ名と完了状態を正しく組み合わせられたことを表します。`,
      successCriteria: [
        `${variableName}をstring型で宣言している`,
        'completedをboolean型で宣言している',
        `console.logの出力が「${output}」と一致する`,
      ],
      requirements: ['型注釈を1つ以上使う', '自分で変数と出力処理を書く', `「${output}」を出力する`],
      starterCode: [
        '// この下にコードを書いてください。',
        '// 分からないときは「書き方ガイド」を開きましょう。',
        '',
      ].join('\n'),
      solution: code,
      expectedOutput: output,
      hints: ['変数に代入した値と型注釈が一致しているか確認します。', 'console.logへ渡す値を左から順番に追います。'],
      guideSteps: [
        `STEP 1: ${variableName}という名前の変数を宣言し、string型を付ける`,
        `STEP 2: その変数へ「${safeTopic}」を代入する`,
        'STEP 3: completedというboolean型の変数を宣言する',
        `STEP 4: console.logを使い、「${output}」が表示される形にする`,
      ],
      examPoint: '型、値、出力結果を別々に確認すると、コード読解問題にも応用できます。',
    },
    review: [safeTopic, '型注釈と型推論', 'コードを1行ずつ読む', '出力を予想してから実行する', safeGoal],
  };
}

function normalizeLesson(value: Partial<Lesson>, fallback: Lesson): Lesson {
  return {
    ...fallback,
    ...value,
    id: `ai-${Date.now()}`,
    step: 0,
    chapter: 'AIカスタム講座',
    source: 'ai',
    learningGoals: Array.isArray(value.learningGoals) && value.learningGoals.length ? value.learningGoals : fallback.learningGoals,
    pitfalls: Array.isArray(value.pitfalls) && value.pitfalls.length ? value.pitfalls : fallback.pitfalls,
    keyPoints: Array.isArray(value.keyPoints) && value.keyPoints.length ? value.keyPoints : fallback.keyPoints,
    lineByLine: Array.isArray(value.lineByLine) && value.lineByLine.length ? value.lineByLine : fallback.lineByLine,
    sections: Array.isArray(value.sections) && value.sections.length ? value.sections : fallback.sections,
    comparisons: Array.isArray(value.comparisons) && value.comparisons.length ? value.comparisons : fallback.comparisons,
    extraExamples: Array.isArray(value.extraExamples) && value.extraExamples.length ? value.extraExamples : fallback.extraExamples,
    checkpoints: Array.isArray(value.checkpoints) && value.checkpoints.length ? value.checkpoints : fallback.checkpoints,
    review: Array.isArray(value.review) && value.review.length ? value.review : fallback.review,
    exercise: {
      ...fallback.exercise,
      ...(value.exercise || {}),
      id: `ai-${Date.now()}-exercise`,
      starterCode: fallback.exercise.starterCode,
      guideSteps: Array.isArray(value.exercise?.guideSteps) && value.exercise.guideSteps.length
        ? value.exercise.guideSteps
        : fallback.exercise.guideSteps,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GeneratorRequest;
    const topic = body.topic?.trim() || '';
    const level = body.level || 'basic';
    const goal = body.goal?.trim() || '';
    const minutes = Math.min(90, Math.max(15, Number(body.minutes) || 35));

    if (topic.length < 2) {
      return NextResponse.json({ success: false, error: '学びたいテーマを2文字以上で入力してください。' }, { status: 400 });
    }

    const fallback = createFallbackLesson(topic, level, goal, minutes);
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: true, lesson: fallback, isMock: true });
    }

    const modelName = body.model?.trim() || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent([
      'あなたはTypeScriptとWebフルスタック開発を教える初心者向け学習教材の編集者です。',
      '指定テーマについて、単なる説明文ではなく、概念理解、使い分け、コード読解、演習、復習まで含む日本語講座を1本作ってください。',
      'React、Next.js、API、DB、認証などのテーマでは、ブラウザ・サーバー・DBの責務とデータの流れを説明してください。',
      'TypeScriptとして正しい短いコードを使い、危険なanyの多用や高度すぎる話題を避けてください。コード演習はブラウザ内で確認できるよう、外部パッケージなしの小さな例にしてください。',
      'exerciseには必ずtaskGoal、inputSpec、outputSpec、successCriteriaを入れてください。taskGoalには「何を作るコードか」、inputSpecには「どの値や入力を使うか」、outputSpecには「出力が何を意味するか」を初心者向けに書いてください。',
      'exercise.starterCodeには完成コードを書かず、学習者が最初から入力するためのコメントだけを入れてください。exercise.guideStepsには答えのコードそのものではなく、STEP 1から始まる作業手順を4〜6件入れてください。',
      '説明は「30秒で分かる一言」「身近なたとえ」「基本の仕組み」「一行ずつのコード説明」「よくある失敗」「実務ではどう使うか」の順にしてください。',
      '専門用語を使う場合は、初登場時にかっこ内で短い意味を添えてください。一文を短くし、一度に一つの考えだけ説明してください。',
      `テーマ: ${topic}`,
      `難易度: ${level}`,
      `目標: ${goal || `${topic}をコードで使えるようになる`}`,
      `目安時間: ${minutes}分`,
      '次のLesson型と同じキーを持つJSONだけを返してください。id、step、chapter、sourceは省略可能です。',
      JSON.stringify(fallback),
    ].join('\n\n'));

    const parsed = JSON.parse(result.response.text()) as Partial<Lesson>;
    return NextResponse.json({ success: true, lesson: normalizeLesson(parsed, fallback), isMock: false, model: modelName });
  } catch (error) {
    const message = error instanceof Error ? error.message : '講座を生成できませんでした。';
    return NextResponse.json({ success: false, error: `AI講座の生成に失敗しました: ${message}` }, { status: 500 });
  }
}
