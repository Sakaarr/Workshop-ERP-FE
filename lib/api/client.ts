import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: { "Content-Type": "application/json" },
    timeout: 30_000,
  });

  // ── Request: attach access token ──────────────────
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response: handle 401, refresh token ──────────
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) throw new Error("No refresh token");
          const { data } = await client.post("/auth/refresh", {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          if (original.headers)
            original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();