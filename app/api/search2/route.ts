// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const encoded = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encoded}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });
  const html = await res.text();

  const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!match) {
    return NextResponse.json({ error: 'ytInitialData not found' }, { status: 500 });
  }

  const jsonStr = match[1];
  let data: any;

  try {
    data = JSON.parse(jsonStr);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse ytInitialData' }, { status: 500 });
  }

  const contents =
    data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  const results: { title: string; videoId: string }[] = [];

  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents;
    if (!items) continue;

    for (const item of items) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        const title = v.title?.runs?.[0]?.text || '(no title)';
        results.push({ title, videoId: v.videoId });
      }
    }
  }

  return NextResponse.json(results);
}
