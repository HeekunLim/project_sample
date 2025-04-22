import { NextResponse } from "next/server";
import { getSpotifyAccessToken } from "../../../utils/spotify";

// 유튜브 영상에서 추출한 곡 정보를 위한 인터페이스
interface SongInfo {
  title: string;
  artist: string;
  isrc?: string;
}

// 최종 응답을 위한 인터페이스
interface ResponseData {
  songs: SongInfo[];
  isrcList: string[];
  youtubeSearchQuery: string;
}

export async function POST(request: Request) {
  try {
    // 요청 본문에서 videoId와 extractedSongs 배열 받기
    const { videoId, extractedSongs } = await request.json();

    if (!videoId && !extractedSongs) {
      return NextResponse.json(
        { error: "Video ID or extracted songs list is required" },
        { status: 400 }
      );
    }

    // 비디오 ID가 제공된 경우 해당 영상에서 곡 목록 추출
    let songs: SongInfo[] = [];
    if (videoId) {
      const songsFromVideo = await extractSongsFromYouTubeVideo(videoId);
      songs = [...songsFromVideo];
    }

    // 직접 extractedSongs가 제공된 경우
    if (extractedSongs && Array.isArray(extractedSongs)) {
      songs = [...songs, ...extractedSongs];
    }

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "No songs found in the provided video or list" },
        { status: 404 }
      );
    }

    // Spotify API를 통해 ISRC 코드 가져오기
    const songsWithIsrc = await Promise.all(
      songs.map(async (song) => {
        try {
          const isrc = await getIsrcFromSpotify(song.title, song.artist);
          return { ...song, isrc };
        } catch (error) {
          console.error(
            `Error getting ISRC for ${song.title} by ${song.artist}:`,
            error
          );
          return song; // ISRC를 가져오지 못한 경우 원래 곡 정보 반환
        }
      })
    );

    // 유효한 ISRC만 필터링
    const validIsrcs = songsWithIsrc
      .filter((song) => song.isrc)
      .map((song) => song.isrc as string);

    // YouTube 검색 쿼리 생성 (OR 연산자 사용) - isrc: 접두어 제거
    const youtubeSearchQuery = validIsrcs.join(" OR ");

    // 최종 응답 데이터
    const responseData: ResponseData = {
      songs: songsWithIsrc,
      isrcList: validIsrcs,
      youtubeSearchQuery,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// 유튜브 영상에서 곡 정보 추출하는 함수
async function extractSongsFromYouTubeVideo(
  videoId: string
): Promise<SongInfo[]> {
  try {
    // API 요청을 위한 URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_YOUTUBE_API_URL_VIDEOS;
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const apiUrl = `${baseUrl}?&key=${apiKey}&part=snippet&id=${videoId}`;

    // API 요청
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch video data");
    }

    // 응답 데이터 파싱
    const data = await response.json();
    const rawDescription = data?.items?.[0]?.snippet?.description ?? "";

    if (typeof rawDescription !== "string") {
      return [];
    }

    // 타임스탬프가 있는 줄 추출 및 파싱
    const timelineLines = rawDescription
      .split("\n")
      .filter((line: string) => /[0-9]{1,2}:[0-9]{2}/.test(line));

    // 노래 정보 추출 (제목과 아티스트 분리 시도)
    const songs = timelineLines.map((line: string) => {
      // 타임스탬프 및 공백 제거
      const songText = line
        .replace(/\(?[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\)?\s*~?\s*/g, "")
        .trim();

      return parseSongInfo(songText);
    });

    return songs;
  } catch (error) {
    console.error("Error extracting songs from YouTube video:", error);
    return [];
  }
}

/**
 * 다양한 형식의 곡 정보 문자열을 파싱하는 함수
 *
 * @param songText 파싱할 곡 정보 문자열
 * @returns 파싱된 제목과 아티스트 정보
 */
function parseSongInfo(songText: string): SongInfo {
  // 기본 반환값 (파싱 실패 시)
  const defaultResult = {
    title: songText,
    artist: "",
  };

  if (!songText || songText.trim() === "") {
    return defaultResult;
  }

  // 패턴 1: "Title | Artist" 형식
  const pipePattern = /^(.+?)\s*\|\s*(.+)$/;
  const pipeMatch = songText.match(pipePattern);
  if (pipeMatch) {
    return {
      title: pipeMatch[1].trim(),
      artist: pipeMatch[2].trim(),
    };
  }

  // 패턴 2: "Artist - Title" 형식
  const dashPattern = /^(.+?)\s*[-–—]\s*(.+)$/;
  const dashMatch = songText.match(dashPattern);
  if (dashMatch) {
    // K-Pop 영상은 일반적으로 "아티스트 - 제목" 형식이 많음
    return {
      title: dashMatch[2].trim(),
      artist: dashMatch[1].trim(),
    };
  }

  // 패턴 3: 괄호 안에 아티스트가 있는 경우: "Title (Artist)"
  const parenthesisPattern = /^(.+?)\s*\(\s*([^)]+)\s*\)$/;
  const parenthesisMatch = songText.match(parenthesisPattern);
  if (parenthesisMatch) {
    return {
      title: parenthesisMatch[1].trim(),
      artist: parenthesisMatch[2].trim(),
    };
  }

  // 패턴 4: "Title by Artist" 형식
  const byPattern = /^(.+?)\s+by\s+(.+)$/i;
  const byMatch = songText.match(byPattern);
  if (byMatch) {
    return {
      title: byMatch[1].trim(),
      artist: byMatch[2].trim(),
    };
  }

  // 패턴 5: "Title - Artist" 형식 (아티스트가 뒤에 오는 경우)
  // 이 패턴은 대시 앞에 숫자 또는 특별한 표시가 없는 경우에만 적용
  // 예: "제목 - 아티스트" (한국어 영상에서 종종 볼 수 있는 형식)
  const reverseDashPattern = /^(.+?)\s*[-–—]\s*(.+)$/;
  const reverseDashMatch = songText.match(reverseDashPattern);
  if (reverseDashMatch) {
    // 여기서는 한국어 영상의 경우 제목이 앞에 오는 경우도 많음
    // 패턴 2와 중복되므로 추가 검사 필요 (한글 감지 등)
    // 한글이 포함된 경우 이 패턴을 적용할 수 있음
    const koreanChar = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (koreanChar.test(reverseDashMatch[2])) {
      return {
        title: reverseDashMatch[1].trim(),
        artist: reverseDashMatch[2].trim(),
      };
    }
  }

  // 파싱 실패 시 기본값 반환
  return defaultResult;
}

// Spotify API를 통해 ISRC 코드 가져오는 함수
async function getIsrcFromSpotify(
  title: string,
  artist: string
): Promise<string | undefined> {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyBaseurl = process.env.NEXT_PUBLIC_SPOTIFY_API_BASEURL;

    // 제목과 아티스트로 Spotify 검색 쿼리 생성
    const searchQuery = `${title} ${artist}`.trim();
    if (!searchQuery) {
      return undefined;
    }

    const response = await fetch(
      `${spotifyBaseurl}/search?q=${encodeURIComponent(
        searchQuery
      )}&type=track&limit=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Cannot get track information from Spotify");
    }

    const data = await response.json();
    const track = data?.tracks?.items?.[0];

    if (!track) {
      return undefined;
    }

    // 트랙에서 ISRC 코드 추출
    const isrc = track.external_ids?.isrc;
    return isrc;
  } catch (error) {
    console.error("Error getting ISRC from Spotify:", error);
    return undefined;
  }
}
