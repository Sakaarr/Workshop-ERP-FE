import { apiClient } from "./client";

export interface DashboardStats {
  revenue: {
    today: string;
    this_week: string;
    this_month: string;
    last_month: string;
    growth_percent: number;
  };
  jobs: {
    total_active: number;
    waiting: number;
    diagnosing: number;
    repairing: number;
    waiting_parts: number;
    ready: number;
    completed_today: number;
    completed_this_month: number;
  };
  inventory: {
    total_items: number;
    low_stock_count: number;
    total_value: string;
  };
  customers: {
    total: number;
    new_this_month: number;
    with_outstanding: number;
  };
}

export interface RevenueChartPoint {
  date: string;
  income: string;
  expense: string;
}

export interface JobStatusChartPoint {
  status: string;
  count: number;
  color: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  total_spent: string;
  job_count: number;
}
export interface SupplierPartStat {
  supplier_id: string;
  supplier_name: string;
  parts_count: number;
  total_stock_value: string;
}

export const analyticsApi = {
  dashboard: () =>
    apiClient.get<DashboardStats>("/analytics/dashboard").then(r => r.data),

  revenueChart: (days = 30) =>
    apiClient.get<RevenueChartPoint[]>("/analytics/revenue-chart", { params: { days } }).then(r => r.data),

  jobStatusChart: () =>
    apiClient.get<JobStatusChartPoint[]>("/analytics/job-status-chart").then(r => r.data),

  topCustomers: (limit = 5) =>
    apiClient.get<TopCustomer[]>("/analytics/top-customers", { params: { limit } }).then(r => r.data),

  supplierParts: () =>
    apiClient.get<SupplierPartStat[]>("/analytics/supplier-parts").then(r => r.data),
};