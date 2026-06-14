import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const FEEDS = [
  {
    name: 'Yahoo!ニュース (自動車)',
    url: 'https://news.yahoo.co.jp/rss/topics/car.xml',
  },
  {
    name: 'Car Watch',
    url: 'https://car.watch.impress.co.jp/data/rss/link/carwatch.xml',
  },
  {
    name: 'Google News (自動車)',
    url: 'https://news.google.com/rss/search?q=%E8%87%AA%E5%8B%95%E8%BB%8A&hl=ja&gl=JP&ceid=JP:ja',
  },
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
  category: string;
}

const parser = new Parser({
  customFields: {
    item: [['description', 'summary']],
  },
});

function detectCategory(title: string, summary: string): string {
  const content = (title + ' ' + summary).toLowerCase();
  
  if (
    content.includes('ev') ||
    content.includes('電気自動車') ||
    content.includes('バッテリー') ||
    content.includes('水素') ||
    content.includes('fcv') ||
    content.includes('ハイブリッド') ||
    content.includes('hev') ||
    content.includes('phev')
  ) {
    return 'EV・エコカー';
  }
  
  if (
    content.includes('f1') ||
    content.includes('wrc') ||
    content.includes('レース') ||
    content.includes('ラリー') ||
    content.includes('モータースポーツ') ||
    content.includes('スーパーgt') ||
    content.includes('サーキット')
  ) {
    return 'モータースポーツ';
  }
  
  if (
    content.includes('自動運転') ||
    content.includes('運転支援') ||
    content.includes('コネクテッド') ||
    content.includes('ai') ||
    content.includes('adas') ||
    content.includes('センサー') ||
    content.includes('ソフトウェア') ||
    content.includes('バッテリー技術')
  ) {
    return 'テクノロジー';
  }
  
  if (
    content.includes('新型') ||
    content.includes('新車') ||
    content.includes('発表') ||
    content.includes('発売') ||
    content.includes('公開') ||
    content.includes('デビュー') ||
    content.includes('コンセプト') ||
    content.includes('マイナーチェンジ') ||
    content.includes('フルモデルチェンジ')
  ) {
    return '新型車';
  }
  
  return '業界・一般';
}

export async function GET() {
  try {
    const fetchPromises = FEEDS.map(async (feedInfo) => {
      try {
        const feed = await parser.parseURL(feedInfo.url);
        return feed.items.map((item) => {
          const title = item.title || '';
          const summary = item.summary || item.contentSnippet || '';
          return {
            title: title.replace(/ - Yahoo!ニュース$/, ''), // Yahooニュースの末尾のソース名を消去
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feedInfo.name,
            summary: summary,
            category: detectCategory(title, summary),
          };
        });
      } catch (err) {
        console.error(`Failed to fetch feed: ${feedInfo.name}`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const flatResults = results.flat();

    // 重複排除 (タイトルまたはリンクが同じものを排除)
    const seenTitles = new Set<string>();
    const seenLinks = new Set<string>();
    const uniqueItems: NewsItem[] = [];

    for (const item of flatResults) {
      if (!item.title || !item.link) continue;
      
      // タイトルの類似度簡易比較（完全に同じか、一部が同じか）
      const normalizedTitle = item.title.trim().toLowerCase();
      if (seenTitles.has(normalizedTitle) || seenLinks.has(item.link)) {
        continue;
      }
      
      seenTitles.add(normalizedTitle);
      seenLinks.add(item.link);
      uniqueItems.push(item);
    }

    // 日付順にソート (新しい順)
    uniqueItems.sort((a, b) => {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return NextResponse.json({ success: true, count: uniqueItems.length, data: uniqueItems });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching car news:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
