import { apiFetch } from "./api";
import type { AuthUser } from "@/shared/store/auth.store";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<TokenPair>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: (refresh_token: string) =>
    apiFetch<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),
  me: () => apiFetch<AuthUser>("/api/auth/me"),
};
