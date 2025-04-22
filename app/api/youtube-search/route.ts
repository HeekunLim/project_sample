import { NextResponse } from "next/server";

interface YouTubeSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 }
      );
    }

    // YouTube Data API를 사용하여 검색 수행
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
      query
    )}&type=video&key=${apiKey}`;

    const response = await fetch(youtubeApiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: "Failed to fetch from YouTube API",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 검색 결과 형식 변환
    const formattedResults: YouTubeSearchResult[] = data.items.map(
      (item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
      })
    );

    return NextResponse.json({
      results: formattedResults,
      totalResults: data.pageInfo?.totalResults || 0,
      nextPageToken: data.nextPageToken || null,
    });
  } catch (error) {
    console.error("Error searching YouTube videos:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube videos" },
      { status: 500 }
    );
  }
}
