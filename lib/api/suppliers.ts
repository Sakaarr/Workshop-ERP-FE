import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  pan_vat: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierCreate {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  pan_vat?: string;
  notes?: string;
}

export const suppliersApi = {
  list: (params: { page?: number; page_size?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Supplier>>("/suppliers", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Supplier>(`/suppliers/${id}`).then(r => r.data),

  create: (data: SupplierCreate) =>
    apiClient.post<Supplier>("/suppliers", data).then(r => r.data),

  update: (id: string, data: Partial<SupplierCreate>) =>
    apiClient.patch<Supplier>(`/suppliers/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/suppliers/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.post("/suppliers/bulk-delete", { ids }),
};
