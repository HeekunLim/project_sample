"use client";

import { useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");       // 유튜브 영상 URL
  const [description, setDescription] = useState(""); // 유튜브 영상 설명
  const [searchResults, setSearchResults] = useState<{ [key: string]: any[] }>({}); // 검색 결과 저장

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "www.youtube.com" && urlObj.searchParams.has("v")) {
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
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
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
      <div>
        <input
          type="text"
          placeholder="유튜브 URL 입력"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={fetchVideoDescription}>타임라인 가져오기</button>
      </div>
      {description && description !== "영상에 타임라인이 없습니다." ? (
        <div>
          {description.split("\n").map((line, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ marginRight: "8px" }}>{line}</p>
                <button onClick={() => handleSearch(line)}>유튜브 검색</button>
              </div>
              {searchResults[line] && (
                <div>
                  {searchResults[line].map((result, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginLeft: "16px", marginBottom: "8px" }}>
                      <img src={result.snippet.thumbnails.default.url} alt="Thumbnail" style={{ marginRight: "16px" }} />
                      <div>
                        <p dangerouslySetInnerHTML={{ __html: result.snippet.title }}></p>
                        <p>{result.snippet.channelTitle}</p>
                        <p>{result.id.videoId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        description && <p>{description}</p>
      )}
    </div>
  );
}