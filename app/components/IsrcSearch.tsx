"use client";

import React, { useState } from "react";
import {
  createSearchUrlFromVideoId,
  SongInfo,
  fetchSongsByIsrc,
} from "@/utils/fetchSongsByIsrc";

export default function IsrcSearch() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongInfo[]>([]);
  const [editingSongIndex, setEditingSongIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedArtist, setEditedArtist] = useState("");
  const [searchUrl, setSearchUrl] = useState<string | null>(null);

  // YouTube URL에서 비디오 ID 추출
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
      setError("잘못된 YouTube URL입니다. 올바른 URL을 입력하세요.");
      return null;
    } catch (error) {
      setError("잘못된 URL 형식입니다.");
      return null;
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setSongs([]);
      setSearchUrl(null);

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        setLoading(false);
        return;
      }

      const result = await createSearchUrlFromVideoId(videoId);
      setSongs(result.songs);
      setSearchUrl(result.searchUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 곡 정보 수정 시작
  const startEditing = (index: number) => {
    const song = songs[index];
    setEditingSongIndex(index);
    setEditedTitle(song.title);
    setEditedArtist(song.artist);
  };

  // 곡 정보 수정 취소
  const cancelEditing = () => {
    setEditingSongIndex(null);
    setEditedTitle("");
    setEditedArtist("");
  };

  // 곡 정보 수정 저장
  const saveEditing = async () => {
    if (editingSongIndex === null) return;

    // 원본 songs 배열의 복사본 생성
    const updatedSongs = [...songs];

    // 특정 인덱스의 곡 정보 업데이트
    updatedSongs[editingSongIndex] = {
      ...updatedSongs[editingSongIndex],
      title: editedTitle,
      artist: editedArtist,
      isrc: undefined, // ISRC는 초기화 (새로운 정보로 다시 조회 필요)
    };

    setSongs(updatedSongs);
    setEditingSongIndex(null);

    // 수정된 곡의 ISRC 다시 조회
    try {
      setLoading(true);
      // 개별 곡 정보로 ISRC 조회
      const result = await fetchSongsByIsrc({
        extractedSongs: [{ title: editedTitle, artist: editedArtist }],
      });

      if (result.songs.length > 0 && result.songs[0].isrc) {
        // 조회된 ISRC 업데이트
        updatedSongs[editingSongIndex].isrc = result.songs[0].isrc;
        setSongs([...updatedSongs]);

        // 모든 곡의 ISRC로 검색 쿼리 업데이트
        const validIsrcs = updatedSongs
          .filter((song) => song.isrc)
          .map((song) => song.isrc as string);

        if (validIsrcs.length > 0) {
          const newQuery = validIsrcs.join(" OR ");
          setSearchUrl(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              newQuery
            )}`
          );
        }
      }
    } catch (error) {
      console.error("Error updating ISRC:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">유튜브 영상 곡 ISRC 검색</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube 영상 URL을 입력하세요"
          className="flex-grow p-2 border rounded-l"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !videoUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {songs.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            추출된 곡 목록{" "}
            <span className="text-sm font-normal text-gray-500">
              (제목과 아티스트를 클릭하여 수정할 수 있습니다)
            </span>
          </h3>
          <ul className="border rounded divide-y">
            {songs.map((song, index) => (
              <li key={index} className="p-3">
                {editingSongIndex === index ? (
                  // 수정 모드
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="block text-sm text-gray-600">
                        제목:
                      </label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        아티스트:
                      </label>
                      <input
                        type="text"
                        value={editedArtist}
                        onChange={(e) => setEditedArtist(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEditing}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        disabled={loading}
                      >
                        {loading ? "저장 중..." : "저장"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        disabled={loading}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div className="flex justify-between">
                    <div
                      onClick={() => startEditing(index)}
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded flex-grow"
                    >
                      <p className="font-medium">{song.title || "제목 없음"}</p>
                      <p className="text-gray-600">
                        {song.artist || "아티스트 정보 없음"}
                      </p>
                    </div>
                    {song.isrc && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded self-center">
                        ISRC: {song.isrc}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">YouTube 검색 결과</h3>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            YouTube에서 모든 곡 검색하기
          </a>
          <p className="text-sm text-gray-600 mt-2">
            이 링크는 추출된 곡들의 ISRC 코드를 사용하여 YouTube에서 해당 곡들을
            모두 검색합니다. (OR 연산자로 연결됨)
          </p>
        </div>
      )}
    </div>
  );
}
