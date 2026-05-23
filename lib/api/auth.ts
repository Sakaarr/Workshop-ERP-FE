import { apiClient } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "super_admin" | "admin" | "staff";
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  me: () =>
    apiClient.get<UserResponse>("/auth/me").then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken })
      .then((r) => r.data),
};