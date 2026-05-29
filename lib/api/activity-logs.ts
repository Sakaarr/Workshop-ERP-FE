import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  resource_label: string | null;
  description: string;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export const activityLogsApi = {
  list: (params: {
    page?: number;
    page_size?: number;
    action?: string;
    user_id?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<ActivityLog>>("/activity-logs", { params })
      .then(r => r.data),

  recent: (limit = 20) =>
    apiClient
      .get<ActivityLog[]>("/activity-logs/recent", { params: { limit } })
      .then(r => r.data),
};