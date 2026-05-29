import { apiClient } from "./client";
import type { PaginatedResponse } from "./customers";

export interface DayBookEntry {
  id: string;
  entry_type: "income" | "expense";
  amount: string;
  description: string;
  category: string;
  entry_date: string;
  reference_id: string | null;
  reference_type: string | null;
  created_by: string;
  created_at: string;
  created_by_name: string | null;
}

export interface DayBookSummary {
  date: string;
  total_income: string;
  total_expense: string;
  net: string;
  entries: DayBookEntry[];
}

export interface DayBookEntryCreate {
  entry_type: "income" | "expense";
  amount: string;
  description: string;
  category: string;
  entry_date: string;
}

export const INCOME_CATEGORIES = ["Service Revenue", "Parts Sale", "Advance Payment", "Other Income"];
export const EXPENSE_CATEGORIES = ["Parts Purchase", "Salary", "Utilities", "Rent", "Fuel", "Tools", "Maintenance", "Other Expense"];

export const daybookApi = {
  summary: (date: string) =>
    apiClient.get<DayBookSummary>("/daybook/summary", { params: { date } }).then(r => r.data),

  range: (start: string, end: string) =>
    apiClient.get<DayBookSummary[]>("/daybook/range", { params: { start, end } }).then(r => r.data),

  list: (params: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<DayBookEntry>>("/daybook", { params }).then(r => r.data),

  create: (data: DayBookEntryCreate) =>
    apiClient.post<DayBookEntry>("/daybook", data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/daybook/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.post("/daybook/bulk-delete", { ids }),
};
