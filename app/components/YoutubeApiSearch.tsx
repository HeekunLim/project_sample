"use client";

import React, { useState } from "react";
import {
  searchVideosByIsrcFromYouTubeId,
  SongInfo,
  YouTubeSearchResult,
} from "@/utils/fetchSongsByIsrc";

export default function YoutubeApiSearch() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongInfo[]>([]);
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [editingSongIndex, setEditingSongIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedArtist, setEditedArtist] = useState("");

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
      setSearchResults([]);
      setTotalResults(0);

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        setLoading(false);
        return;
      }

      // YouTube API를 통해 ISRC 검색 결과 가져오기
      const result = await searchVideosByIsrcFromYouTubeId(videoId);
      setSongs(result.songs);
      setSearchResults(result.searchResults);
      setTotalResults(result.totalResults);
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

  // 곡 정보 수정 저장 및 다시 검색
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

    // 현재는 편집 후 다시 검색하는 기능은 생략 (복잡도 증가)
    // 간단하게 수정만 적용
  };

  // YouTube 비디오 URL 생성
  const getVideoUrl = (videoId: string) => {
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">유튜브 영상 곡 ISRC API 검색</h2>

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
          {loading ? "검색 중..." : "YouTube API 검색"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {songs.length > 0 && (
        <div className="mb-6">
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

      {searchResults.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            YouTube API 검색 결과 ({totalResults}개)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((video) => (
              <div
                key={video.id}
                className="border rounded overflow-hidden shadow-sm"
              >
                <a
                  href={getVideoUrl(video.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90"
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
                <div className="p-3">
                  <a
                    href={getVideoUrl(video.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="font-medium line-clamp-2 hover:text-blue-600">
                      {video.title}
                    </h4>
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    {video.channelTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    게시일: {formatDate(video.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        songs.length > 0 &&
        !loading && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              검색 결과가 없습니다. 다른 영상을 시도해보세요.
            </p>
          </div>
        )
      )}
    </div>
  );
}
