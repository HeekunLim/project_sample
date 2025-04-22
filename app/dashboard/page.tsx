"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">사용자 정보</h2>
          {user ? (
            <div>
              <p className="mb-2">
                <strong>이름:</strong> {user.name}
              </p>
              <p className="mb-2">
                <strong>이메일:</strong> {user.email}
              </p>
              <p className="mb-2">
                <strong>ID:</strong> {user.id}
              </p>
            </div>
          ) : (
            <p>사용자 정보를 불러오는 중...</p>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-medium mb-2">보호된 콘텐츠</h3>
            <p>이 페이지는 로그인한 사용자만 볼 수 있습니다.</p>
            <p className="mt-2">
              Zustand와 persist 미들웨어를 사용하여 로그인 상태가 브라우저
              새로고침 후에도 유지됩니다.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
