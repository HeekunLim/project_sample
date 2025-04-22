import { useAuthStore } from "@/store/authStore";

// 인증 관련 로직을 담은 커스텀 훅
export function useAuth() {
  const { isAuthenticated, token, user, login, logout, setToken } =
    useAuthStore();

  // 토큰이 유효한지 확인 (예: JWT 토큰 만료 확인 등)
  const isTokenValid = (): boolean => {
    if (!token) return false;

    // 여기에 JWT 토큰 검증 로직 추가 가능
    // 예: JWT decode 후 exp 시간 확인 등

    return true;
  };

  // API 요청 시 사용할 인증 헤더 생성
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    isAuthenticated,
    token,
    user,
    login,
    logout,
    setToken,
    isTokenValid,
    getAuthHeader,
  };
}
