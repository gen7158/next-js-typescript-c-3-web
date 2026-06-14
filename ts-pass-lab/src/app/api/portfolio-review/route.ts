import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { PortfolioScore } from '@/types/platform';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      title?: string;
      description?: string;
      code?: string;
      repositoryUrl?: string;
      demoUrl?: string;
      score?: PortfolioScore;
      apiKey?: string;
      model?: string;
    };
    if (!body.title?.trim() || !body.code?.trim()) {
      return NextResponse.json({ success:false, error:'作品名とコードを入力してください。' }, { status:400 });
    }
    const fallback = [
      `総合評価: ${body.score?.total || 0}/100`,
      '良い点: 作品としてコードを提出し、改善点を見える形にできています。',
      '次の改善: READMEへ「利用者の課題」「技術を選んだ理由」「テスト方法」を追加してください。',
      '面接練習: この作品で最も苦労した点と、どう切り分けて解決したかを1分で説明してみましょう。',
    ].join('\n\n');
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success:true, review:fallback, isMock:true });

    const modelName = body.model?.trim() || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model:modelName });
    const result = await model.generateContent([
      'あなたは未経験からフルスタックエンジニアを目指す学習者の、やさしく厳密な技術面接官です。',
      '良い点、採用担当へ伝わりにくい点、技術的リスク、優先して直す3点、面接で聞く質問2問の順で日本語レビューしてください。',
      '初心者を否定せず、各改善について「なぜ必要か」と「最初の一歩」を説明してください。',
      `作品名: ${body.title}`,
      `説明: ${body.description || '未入力'}`,
      `自動採点: ${JSON.stringify(body.score || {})}`,
      `GitHub: ${body.repositoryUrl || '未登録'}`,
      `公開URL: ${body.demoUrl || '未登録'}`,
      `コード:\n${body.code.slice(0, 16000)}`,
    ].join('\n\n'));
    const review = result.response.text();
    if (!review.trim()) throw new Error('AIの回答が空でした。');
    return NextResponse.json({ success:true, review, isMock:false, model:modelName });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AIレビューを生成できませんでした。';
    return NextResponse.json({ success:false, error:`AIレビューに失敗しました: ${message}` }, { status:500 });
  }
}
