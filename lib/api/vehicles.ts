import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface Vehicle {
  id: string;
  customer_id: string;
  plate_number: string;
  vin: string | null;
  engine_number: string | null;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid" | "cng" | "other";
  last_odometer: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface VehicleCreate {
  customer_id: string;
  plate_number: string;
  vin?: string;
  engine_number?: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  fuel_type: Vehicle["fuel_type"];
  last_odometer?: number;
}

export const vehiclesApi = {
  list: (params: { page?: number; page_size?: number; search?: string; customer_id?: string }) =>
    apiClient.get<PaginatedResponse<Vehicle>>("/vehicles", { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`).then(r => r.data),

  byCustomer: (customerId: string) =>
    apiClient.get<Vehicle[]>(`/vehicles/by-customer/${customerId}`).then(r => r.data),

  create: (data: VehicleCreate) =>
    apiClient.post<Vehicle>("/vehicles", data).then(r => r.data),

  update: (id: string, data: Partial<VehicleCreate>) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/vehicles/${id}`),
};