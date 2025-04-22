"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const { login, isAuthenticated, logout, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 실제 API 요청으로 대체할 수 있습니다
      // 여기에서는 임시로 로그인 프로세스 시뮬레이션
      const response = await mockLoginApi(email, password);

      // 성공 시 Zustand store 업데이트
      login(response.token, {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 임시 로그인 API 호출 (실제 API로 대체 필요)
  const mockLoginApi = async (email: string, password: string) => {
    // 실제 API 호출로 대체하세요
    return new Promise<{
      token: string;
      user: { id: string; name: string; email: string };
    }>((resolve, reject) => {
      // 간단한 유효성 검사
      if (email === "test@example.com" && password === "password") {
        // 성공 시 임시 데이터 반환
        setTimeout(() => {
          resolve({
            token: "mock-jwt-token-xyz",
            user: {
              id: "1",
              name: "테스트 사용자",
              email: "test@example.com",
            },
          });
        }, 500);
      } else {
        // 실패 시 에러 반환
        setTimeout(() => {
          reject(new Error("이메일 또는 비밀번호가 올바르지 않습니다."));
        }, 500);
      }
    });
  };

  // 이미 로그인한 경우 로그아웃 버튼과 사용자 정보 표시
  if (isAuthenticated && user) {
    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">로그인 상태</h2>
        <div className="mb-4">
          <p>
            <strong>이름:</strong> {user.name}
          </p>
          <p>
            <strong>이메일:</strong> {user.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 focus:outline-none"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">로그인</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none disabled:bg-blue-300"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>테스트 계정: test@example.com / password</p>
      </div>
    </div>
  );
}
