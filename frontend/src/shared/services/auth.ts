import { apiFetch } from "./api";
import type { AuthUser } from "@/shared/store/auth.store";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiFetch<RegisterResult>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
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
