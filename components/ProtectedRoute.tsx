"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isTokenValid } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 인증되지 않았거나 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
    if (!isAuthenticated || !isTokenValid()) {
      router.push("/login");
    }
  }, [isAuthenticated, isTokenValid, router]);

  // 인증되지 않은 경우 로딩 표시 또는 null 반환
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">접근 권한이 필요합니다</h2>
          <p className="mb-4">로그인 페이지로 이동합니다...</p>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}
