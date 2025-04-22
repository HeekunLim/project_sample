"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [videoUrl, setVideoUrl] = useState(""); // 유튜브 영상 URL
  const [description, setDescription] = useState(""); // 유튜브 영상 설명
  const [searchResults, setSearchResults] = useState<{ [key: string]: any[] }>(
    {}
  ); // 검색 결과 저장

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname === "www.youtube.com" &&
        urlObj.searchParams.has("v")
      ) {
        return urlObj.searchParams.get("v");
      } else if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      alert("잘못된 YouTube URL입니다. 올바른 URL을 입력하세요.");
      return null;
    } catch (error) {
      alert("잘못된 URL 형식입니다.");
      return null;
    }
  };

  const fetchVideoDescription = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    try {
      const response = await fetch(`/api/videos?id=${videoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video description");
      }
      const data = await response.json();
      setDescription(data.description);
    } catch (error) {
      console.error("Error fetching video description:", error);
    }
  };

  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setSearchResults((prev) => ({ ...prev, [query]: data.items }));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSearch = (line: string) => {
    if (!searchResults[line]) {
      fetchSearchResults(line);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* 네비게이션 바 */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 mb-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white text-shadow">
            YouTube Timeline Finder
          </h1>
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  대시보드
                </Link>
                <Link
                  href="/login"
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
                >
                  계정 관리
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="text-white hover:text-blue-100 font-medium transition-colors duration-200"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="card mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3">
            유튜브 영상 타임라인 검색
          </h1>
          <div className="mb-6 flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="유튜브 URL 입력"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg flex-grow shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <button
              onClick={fetchVideoDescription}
              className="btn btn-primary px-6 py-3"
            >
              타임라인 가져오기
            </button>
          </div>
        </div>

        {description && description !== "영상에 타임라인이 없습니다." ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              영상 타임라인
            </h2>
            {description.split("\n").map((line, index) => (
              <div
                key={index}
                className="mb-4 border-b pb-4 border-gray-200 hover:bg-gray-50 transition-colors duration-200 p-2 rounded"
              >
                <div className="flex items-center mb-2">
                  <p className="mr-2 text-gray-800 flex-grow">{line}</p>
                  <button
                    onClick={() => handleSearch(line)}
                    className="btn btn-danger"
                  >
                    유튜브 검색
                  </button>
                </div>
                {searchResults[line] && (
                  <div className="mt-3 pl-4 border-l-2 border-blue-200">
                    {searchResults[line].map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center mb-4 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <img
                          src={result.snippet.thumbnails.default.url}
                          alt="Thumbnail"
                          className="mr-4 rounded-md"
                        />
                        <div>
                          <p
                            className="font-medium text-blue-700 mb-1"
                            dangerouslySetInnerHTML={{
                              __html: result.snippet.title,
                            }}
                          ></p>
                          <p className="text-gray-600 mb-1">
                            {result.snippet.channelTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.id.videoId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          description && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">결과</h2>
              <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                {description}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
