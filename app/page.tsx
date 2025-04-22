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
    <div>
      {/* 인증 상태에 따른 네비게이션 링크 */}
      <div className="bg-gray-100 p-4 mb-6">
        <div className="container mx-auto flex justify-end space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                대시보드
              </Link>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                계정 관리
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="유튜브 URL 입력"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={fetchVideoDescription}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            타임라인 가져오기
          </button>
        </div>
        {description && description !== "영상에 타임라인이 없습니다." ? (
          <div>
            {description.split("\n").map((line, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <div className="flex items-center mb-2">
                  <p className="mr-2">{line}</p>
                  <button
                    onClick={() => handleSearch(line)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    유튜브 검색
                  </button>
                </div>
                {searchResults[line] && (
                  <div>
                    {searchResults[line].map((result, idx) => (
                      <div key={idx} className="flex items-center ml-4 mb-2">
                        <img
                          src={result.snippet.thumbnails.default.url}
                          alt="Thumbnail"
                          className="mr-4"
                        />
                        <div>
                          <p
                            dangerouslySetInnerHTML={{
                              __html: result.snippet.title,
                            }}
                          ></p>
                          <p className="text-gray-600">
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
            <p className="p-4 bg-gray-100 rounded">{description}</p>
          )
        )}
      </div>
    </div>
  );
}
