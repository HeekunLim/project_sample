import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);           // 요청 URL을 파싱하여 URL 객체 생성
    const videoId = url.searchParams.get("id"); // 링크에서 "id" 파라미터 추출

    // 비디오 아이디가 없는 경우 에러 처리
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // API 요청을 위한 URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_YOUTUBE_API_URL_VIDEOS;
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const apiUrl = `${baseUrl}?&key=${apiKey}&part=snippet&id=${videoId}`;

    // API 요청
    const response = await fetch(apiUrl);

    // 응답 상태 확인
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch video data" },
        { status: response.status }
      );
    }

    // 응답 데이터 파싱
    const data = await response.json();

    // 응답 데이터에서 설명 추출
    const rawDescription: unknown = data?.items?.[0]?.snippet?.description ?? "No description available";

    // 기본값 설정
    let musicTimeline = "영상에 타임라인이 없습니다.";

    // 설명이 문자열인 경우에만 처리
    if (typeof rawDescription === "string") {
      musicTimeline = rawDescription
        // 줄 단위로 분리 
        .split("\n")
        // 타임스탬프가 포함된 줄만 필터링     
        .filter((line: string) => /[0-9]{1,2}:[0-9]{2}/.test(line))
        // 타임스탬프 및 공백제거
        .map((line: string) => line.replace(/\(?[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\)?\s*~?\s*/g, "").trim())
        // 빈 줄 제거
        .filter((line: string) => line.length > 0)
        // 줄 단위로 다시 합침
        .join("\n");

      // 설명이 비어있거나 "영상에 타임라인이 없습니다."인 경우 기본값으로 설정
      if (!musicTimeline.trim()) {
        musicTimeline = "영상에 타임라인이 없습니다.";
      }
    }

    return NextResponse.json({ description: musicTimeline });
  } catch (error) {
    console.error("Error fetching video data:", error);

    return NextResponse.json(
      { error: "Failed to fetch video data" },
      { status: 500 }
    );
  }
}
