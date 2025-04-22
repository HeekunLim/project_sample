"use client";

import YoutubeApiSearch from "@/app/components/YoutubeApiSearch";

export default function YoutubeApiSearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">YouTube API ISRC 검색</h1>
      <p className="mb-6 text-gray-700">
        이 페이지에서는 유튜브 영상에서 추출한 곡 정보를 Spotify API로 ISRC
        코드를 조회한 후, YouTube Data API를 사용하여 직접 검색 결과를
        가져옵니다.
      </p>
      <YoutubeApiSearch />
    </div>
  );
}
