import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export type JobStatus = "waiting" | "diagnosing" | "repairing" | "waiting_parts" | "ready" | "delivered" | "cancelled";

export interface JobCard {
  id: string;
  job_number: string;
  vehicle_id: string;
  customer_id: string;
  assigned_to: string | null;
  status: JobStatus;
  complaint: string;
  diagnosis: string | null;
  internal_notes: string | null;
  odometer_in: number;
  odometer_out: number | null;
  estimated_cost: string;
  labor_charge: string;
  created_at: string;
  updated_at: string;
}

export interface JobCardListItem extends JobCard {
  customer_name: string | null;
  customer_phone: string | null;
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  assigned_to_name: string | null;
}

export interface JobCardCreate {
  vehicle_id: string;
  customer_id: string;
  complaint: string;
  odometer_in: number;
  assigned_to?: string;
  estimated_cost?: string;
  internal_notes?: string;
}

export const jobCardsApi = {
  list: (params: { page?: number; page_size?: number; search?: string; status?: JobStatus }) =>
    apiClient.get<PaginatedResponse<JobCardListItem>>("/job-cards", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<JobCard>(`/job-cards/${id}`).then(r => r.data),

  create: (data: JobCardCreate) =>
    apiClient.post<JobCard>("/job-cards", data).then(r => r.data),

  update: (id: string, data: Partial<JobCardCreate & { status: JobStatus; diagnosis: string; labor_charge: string }>) =>
    apiClient.patch<JobCard>(`/job-cards/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: JobStatus, notes?: string) =>
    apiClient.patch<JobCard>(`/job-cards/${id}/status`, { status, notes }).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/job-cards/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.post("/job-cards/bulk-delete", { ids }),
};
