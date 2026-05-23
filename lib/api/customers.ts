import { apiClient } from "./client";

export interface Customer {
  id: string;
  name: string;
  phone_primary: string;
  phone_secondary: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  pan_vat: string | null;
  notes: string | null;
  outstanding_balance: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone_primary: string;
  phone_secondary: string | null;
  city: string | null;
  outstanding_balance: string;
  vehicle_count: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CustomerCreate {
  name: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  city?: string;
  pan_vat?: string;
  notes?: string;
}

export const customersApi = {
  list: (params: { page?: number; page_size?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<CustomerListItem>>("/customers", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`).then(r => r.data),

  create: (data: CustomerCreate) =>
    apiClient.post<Customer>("/customers", data).then(r => r.data),

  update: (id: string, data: Partial<CustomerCreate>) =>
    apiClient.patch<Customer>(`/customers/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),
};