import type { Lesson } from '@/types/learning';

export type LearningStage = {
  label: string;
  title: string;
  description: string;
};

export function getLearningStage(step: number): LearningStage {
  if (step <= 9) return { label: 'START', title: 'はじめてのプログラミング', description: 'まずは型、変数、関数を使って、小さなコードを読めるようにします。' };
  if (step <= 21) return { label: 'FOUNDATION', title: 'TypeScript基礎固め', description: 'データの形を安全に表し、エラーを自分で読み解く力を育てます。' };
  if (step <= 33) return { label: 'WEB BEGINNER', title: 'Web開発の入口', description: 'ブラウザ、HTTP、HTML、CSSがどう協力するかを理解します。' };
  if (step <= 41) return { label: 'FRONTEND', title: '画面を作る力', description: 'ReactとNext.jsで、操作できる画面とデータ取得を実装します。' };
  if (step <= 52) return { label: 'BACKEND', title: 'API・DB実践', description: 'サーバー処理、入力検証、SQL、Prismaでデータを安全に扱います。' };
  if (step <= 60) return { label: 'PRODUCTION', title: '実務品質へ', description: '認証、認可、セキュリティ、テスト、デプロイまで扱います。' };
  return { label: 'CAPSTONE', title: 'プロへの総合制作', description: '設計から公開・改善までを一つの成果物として完成させます。' };
}

function analogyFor(lesson: Lesson) {
  const value = `${lesson.category} ${lesson.title}`.toLowerCase();
  if (value.includes('http') || value.includes('api')) return 'レストランで注文票を渡し、厨房から料理が返ってくる流れに似ています。注文がリクエスト、料理がレスポンスです。';
  if (value.includes('react') || value.includes('component')) return '画面をレゴの部品に分け、必要な部品を組み合わせるイメージです。部品ごとに役割を一つにします。';
  if (value.includes('next')) return '受付の画面と、裏側の処理場を同じ建物の中でつなぐ仕組みです。どこで処理するかを意識します。';
  if (value.includes('sql') || value.includes('db') || value.includes('prisma')) return '整理された台帳から、条件に合う行を探したり、新しい行を書き足したりするイメージです。';
  if (value.includes('認証') || value.includes('session') || value.includes('cookie')) return '認証は本人確認、認可は入室できる部屋の確認です。社員証があっても全室へ入れるとは限りません。';
  if (value.includes('test')) return '料理を出す前に、味・温度・量を決めた基準で確認する工程です。変更後も同じ品質か確かめます。';
  if (value.includes('deploy') || value.includes('運用')) return '完成した店を実際に開店し、問題が起きていないか売り場と裏側の記録を見守る段階です。';
  if (value.includes('型') || value.includes('type')) return '荷物の箱に「本専用」「飲み物専用」とラベルを付け、間違った物が入る前に気づく仕組みです。';
  return '大きな仕事を、入力・処理・結果の小さな箱へ分けて考えるイメージです。一箱ずつ確認すると迷いにくくなります。';
}

export function buildBeginnerGuidance(lesson: Lesson) {
  return {
    oneLine: `${lesson.title}では、${lesson.summary} 最初は全体を暗記せず、「何のために使うか」を一つ説明できれば大丈夫です。`,
    analogy: analogyFor(lesson),
    steps: [
      `最初に「${lesson.keyPoints[0] || lesson.title}」の役割だけつかむ`,
      'コード例を上から一行ずつ読み、入力と結果を予想する',
      '演習で値を一つ変え、結果がどう変化するか確かめる',
    ],
    later: `細かな暗記より、まず「${lesson.exercise.expectedOutput}」になるまでの流れを説明できれば十分です。`,
  };
}
