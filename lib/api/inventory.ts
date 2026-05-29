import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface InventoryItem {
  id: string;
  name: string;
  part_number: string | null;
  category: string;
  description: string | null;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
  cost_price: string;
  selling_price: string;
  supplier_id: string | null;
  supplier_name: string | null;
  barcode: string | null;
  location: string | null;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryCreate {
  name: string;
  part_number?: string;
  category: string;
  description?: string;
  unit?: string;
  quantity?: number;
  low_stock_threshold?: number;
  cost_price: string;
  selling_price: string;
  supplier_id?: string;
  barcode?: string;
  location?: string;
}

export const inventoryApi = {
  list: (params: { page?: number; page_size?: number; search?: string; category?: string; low_stock?: boolean }) =>
    apiClient.get<PaginatedResponse<InventoryItem>>("/inventory", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<InventoryItem>(`/inventory/${id}`).then(r => r.data),

  categories: () =>
    apiClient.get<string[]>("/inventory/categories").then(r => r.data),

  lowStock: () =>
    apiClient.get<InventoryItem[]>("/inventory/low-stock").then(r => r.data),

  create: (data: InventoryCreate) =>
    apiClient.post<InventoryItem>("/inventory", data).then(r => r.data),

  update: (id: string, data: Partial<InventoryCreate>) =>
    apiClient.patch<InventoryItem>(`/inventory/${id}`, data).then(r => r.data),

  adjustStock: (id: string, quantity_change: number, reason: string) =>
    apiClient.post<InventoryItem>(`/inventory/${id}/adjust-stock`, { quantity_change, reason }).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.post("/inventory/bulk-delete", { ids }),
};
