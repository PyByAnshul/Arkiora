import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  is_superadmin: boolean;
  company_id: string | null;
}

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthState extends Tokens {
  user: AuthUser | null;
  setTokens: (t: Tokens) => void;
  setUser: (u: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (t) => set(t),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "assetflow-auth" }
  )
);
