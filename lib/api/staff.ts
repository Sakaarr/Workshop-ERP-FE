import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "super_admin" | "admin" | "staff";
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  job_count: number;
}

export const staffApi = {
  list: (params: { page?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<StaffMember>>("/staff", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<StaffMember>(`/staff/${id}`).then(r => r.data),

  me: () =>
    apiClient.get<StaffMember>("/staff/me").then(r => r.data),

  create: (data: { full_name: string; email: string; phone?: string; role: string; password: string }) =>
    apiClient.post<StaffMember>("/staff", data).then(r => r.data),

  update: (id: string, data: Partial<{ full_name: string; phone: string; role: string; is_active: boolean }>) =>
    apiClient.patch<StaffMember>(`/staff/${id}`, data).then(r => r.data),

  resetPassword: (id: string, new_password: string) =>
    apiClient.post(`/staff/${id}/reset-password`, { new_password }),

  changeMyPassword: (current_password: string, new_password: string) =>
    apiClient.post("/staff/me/change-password", { current_password, new_password }),

  delete: (id: string) =>
    apiClient.delete(`/staff/${id}`),
};