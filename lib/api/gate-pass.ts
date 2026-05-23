import { apiClient } from "./client";

export interface GatePass {
  id: string;
  invoice_id: string;
  job_card_id: string;
  verification_code: string;
  is_used: boolean;
  notes: string | null;
  created_at: string;
  customer_name: string | null;
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  job_number: string | null;
  invoice_number: string | null;
  total_amount: string | null;
  payment_status: string | null;
}

export const gatePassApi = {
  list: () =>
    apiClient.get<GatePass[]>("/gate-passes").then(r => r.data),

  get: (id: string) =>
    apiClient.get<GatePass>(`/gate-passes/${id}`).then(r => r.data),

  getByInvoice: (invoiceId: string) =>
    apiClient.get<GatePass | null>(`/gate-passes/by-invoice/${invoiceId}`).then(r => r.data),

  create: (invoice_id: string, job_card_id: string, notes?: string) =>
    apiClient.post<GatePass>("/gate-passes", { invoice_id, job_card_id, notes }).then(r => r.data),

  verify: (verification_code: string) =>
    apiClient.post<GatePass>("/gate-passes/verify", { verification_code }).then(r => r.data),
};