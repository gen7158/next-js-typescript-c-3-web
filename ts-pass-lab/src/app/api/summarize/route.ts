import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || '';

// Gemini APIの初期化（キーがある場合のみ）
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
  try {
    const { title, summary, source } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // APIキーがない場合のモックフォールバック
    if (!genAI) {
      console.warn('GEMINI_API_KEY is not defined. Using mock data.');
      
      // タイトルのキーワードに基づいて少し変化をつける
      const isEV = title.toLowerCase().includes('ev') || title.includes('電気') || title.includes('バッテリー');
      const isMotorsport = title.includes('レース') || title.includes('ラリー') || title.includes('モータースポーツ') || title.includes('f1');
      const isNewCar = title.includes('新型') || title.includes('新車') || title.includes('発表') || title.includes('発売');
      
      let mockData = {
        summary: [
          `「${title}」に関する最新情報が発表されました。`,
          `本記事（情報元: ${source || '自動車メディア'}）は、自動車市場のトレンドを捉えた重要なトピックです。`,
          "AI要約機能の完全な利用には、サーバー側の環境変数 `GEMINI_API_KEY` の設定が必要です。"
        ],
        impact: "この動きにより、短期的には他メーカーとの差別化が進み、長期的には次世代自動車のグローバル基準策定へ影響を及ぼす可能性があります。消費者の選択肢を広げる点でも注目されます。",
        background: "現在、自動車産業は「100年に一度の変革期」に直面しており、電動化やソフトウェア定義車（SDV）への移行が急速に進んでいます。今回の動向もその潮流に沿ったものです。"
      };

      if (isEV) {
        mockData = {
          summary: [
            `EV・エコカー関連ニュース「${title}」について分析します。`,
            "バッテリー技術の進化や充電インフラの整備状況と深く関連している内容です。",
            "航続距離の向上やコスト削減が今後の普及に向けた最大の課題となっています。"
          ],
          impact: "脱炭素社会の実現に向け、電動車のラインナップ拡充はメーカーの死活問題です。この技術革新は、EVの普及スピードをさらに加速させる引き金となるでしょう。",
          background: "世界各国で排出ガス規制が強化される中、中国や欧州メーカーが先行するEV市場に対し、日本勢も含めたグローバルな市場シェア争いが激化しています。"
        };
      } else if (isMotorsport) {
        mockData = {
          summary: [
            `モータースポーツ関連ニュース「${title}」についての速報です。`,
            "過酷なレース環境は、次世代の市販車向け技術を鍛え上げる重要な試験場となっています。",
            "ファンコミュニティの活性化やブランドイメージの大幅な向上が期待されます。"
          ],
          impact: "モータースポーツ活動での成功は、メーカーの技術的アピールとなり、市販車の販売活動にもプラスのシナジー効果をもたらします。",
          background: "近年のモータースポーツは、環境負荷低減のためにハイブリッド燃料や合成燃料（E-Fuel）の導入など、サステナビリティへの移行を急速に進めています。"
        };
      } else if (isNewCar) {
        mockData = {
          summary: [
            `期待の新型モデル「${title}」が市場へ投入されます。`,
            "デザインの刷新だけでなく、最新の安全運転支援システム（ADAS）の搭載が際立っています。",
            "既存の競合車種との価格設定やスペックの比較が活発に行われています。"
          ],
          impact: "新モデルの投入により、同セグメントの市場競争がさらに激化し、シェアの再編が起こる可能性があります。特に新規ユーザー層の獲得が焦点です。",
          background: "自動車メーカーは定期的なモデルチェンジにより、最新技術の標準化とブランドの鮮度維持を図ります。今回は特にデジタルインターフェースの進化が見られます。"
        };
      }

      return NextResponse.json({ success: true, ...mockData, isMock: true });
    }

    // 本物のGemini APIを呼び出す
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
あなたはプロフェッショナルな自動車ジャーナリスト、かつモビリティ業界のアナリストです。
以下の自動車ニュース記事の「タイトル」と「概要」をもとに、客観的かつ深い洞察に基づく解説を生成してください。

ニュースタイトル: ${title}
ニュース概要: ${summary || '概要なし'}
情報元: ${source || '不明'}

出力は必ず以下のJSONフォーマットの仕様に従ってください。マークダウン（\`\`\`json 等）や他のテキストを含めず、純粋なJSONオブジェクトのみを出力してください。キー名と構造を完全に一致させてください。

JSON出力フォーマット:
{
  "summary": [
    "記事の最も重要な要点を簡潔にまとめた日本語テキスト（40文字〜60文字程度）",
    "記事の第二の要点を簡潔にまとめた日本語テキスト（40文字〜60文字程度）",
    "記事の第三の要点（結論や今後の見通し）を簡潔にまとめた日本語テキスト（40文字〜60文字程度）"
  ],
  "impact": "このニュースが自動車業界、競合他社、あるいは一般の消費者や市場に与える影響や意義をプロの視点から分析した解説（日本語で150文字〜200文字程度）",
  "background": "このニュースの裏側にある技術的背景、歴史的文脈、規制の動向、または市場トレンドについて補足した解説（日本語で150文字〜200文字程度）"
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      summary: parsedData.summary || [],
      impact: parsedData.impact || '',
      background: parsedData.background || '',
      isMock: false,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI analysis', details: message },
      { status: 500 }
    );
  }
}
