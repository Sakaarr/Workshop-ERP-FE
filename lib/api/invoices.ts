import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export type PaymentStatus = "pending" | "partial" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "cheque" | "esewa" | "khalti" | "fonepay" | "credit";

export interface Invoice {
  id: string;
  invoice_number: string;
  job_card_id: string;
  customer_id: string;
  subtotal: string;
  discount_amount: string;
  discount_reason: string | null;
  taxable_amount: string;
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  paid_amount: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  job_number: string | null;
  vehicle_plate: string | null;
}

export interface InvoiceCreate {
  job_card_id: string;
  customer_id: string;
  discount_amount?: string;
  discount_reason?: string;
  tax_rate?: string;
  payment_method?: PaymentMethod;
  paid_amount?: string;
  notes?: string;
}

export const invoicesApi = {
  list: (params: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Invoice>>("/invoices", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Invoice>(`/invoices/${id}`).then(r => r.data),

  getByJob: (jobCardId: string) =>
    apiClient.get<Invoice | null>(`/invoices/by-job/${jobCardId}`).then(r => r.data),

  createFromJob: (jobCardId: string, data: Omit<InvoiceCreate, "job_card_id">) =>
    apiClient.post<Invoice>(`/invoices/from-job/${jobCardId}`, data).then(r => r.data),

  recordPayment: (id: string, amount: string, payment_method: PaymentMethod, notes?: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/payment`, { amount, payment_method, notes }).then(r => r.data),

  update: (id: string, data: Partial<InvoiceCreate>) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, data).then(r => r.data),
};