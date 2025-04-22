import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 인증 상태를 위한 인터페이스 정의
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id?: string;
    name?: string;
    email?: string;
  } | null;

  // 로그인 액션
  login: (token: string, userData: any) => void;

  // 로그아웃 액션
  logout: () => void;

  // 토큰 설정 액션
  setToken: (token: string) => void;
}

// persist 미들웨어를 사용하여 인증 상태를 로컬 스토리지에 저장하는 store 생성
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      isAuthenticated: false,
      token: null,
      user: null,

      // 로그인 액션
      login: (token, userData) => {
        set({
          isAuthenticated: true,
          token,
          user: userData,
        });
      },

      // 로그아웃 액션
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        });
      },

      // 토큰 설정 액션
      setToken: (token) => {
        set({
          token,
          isAuthenticated: !!token,
        });
      },
    }),
    {
      name: "auth-storage", // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소로 로컬 스토리지 사용
      // 지속될 상태 선택 (선택사항)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
    }
  )
);
