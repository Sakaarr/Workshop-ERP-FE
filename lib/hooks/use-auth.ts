"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, type LoginPayload } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setTokens, setUser, logout: storeLogout, user, isAuthenticated } = useAuthStore();

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      const currentUser = await authApi.me();
      setUser(currentUser);
      toast.success(`Welcome back, ${currentUser.full_name}!`);
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Invalid credentials. Please try again.");
    },
  });

  const logout = () => {
    storeLogout();
    qc.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return {
    user: me ?? user,
    isAuthenticated,
    isLoading: meLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}