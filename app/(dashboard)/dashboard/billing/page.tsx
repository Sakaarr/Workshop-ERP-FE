"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Receipt, Search, Download, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { invoicesApi, type Invoice } from "@/lib/api/invoices";
import { apiClient } from "@/lib/api/client";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const API_BASE_URL = (apiClient.defaults.baseURL ?? "").replace(/\/$/, "");

const STATUS_CONFIG = {
  paid:      { label: "Paid",    icon: CheckCircle2, class: "text-success bg-success-muted" },
  partial:   { label: "Partial", icon: Clock,        class: "text-info bg-info-muted" },
  pending:   { label: "Pending", icon: AlertCircle,  class: "text-warning bg-warning-muted" },
  cancelled: { label: "Void",    icon: AlertCircle,  class: "text-muted-foreground bg-muted" },
};

export default function BillingPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page],
    queryFn: () => invoicesApi.list({ page, page_size: 20 }),
  });

  const totalPaid = data?.items.reduce((sum, inv) => sum + parseFloat(inv.paid_amount), 0) ?? 0;
  const totalPending = data?.items
    .filter(inv => inv.payment_status !== "paid")
    .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) - parseFloat(inv.paid_amount)), 0) ?? 0;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Billing" />
      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Billing & Invoices</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} invoices</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: data?.total ?? 0, suffix: "" },
            { label: "Paid This Page", value: formatCurrency(totalPaid), suffix: "" },
            { label: "Outstanding", value: formatCurrency(totalPending), suffix: "", color: "text-destructive" },
            { label: "Paid Count", value: data?.items.filter(i => i.payment_status === "paid").length ?? 0, suffix: "" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-xl font-bold mt-1", s.color ?? "text-foreground")}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice number..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Invoice #", "Customer", "Vehicle", "Job Card", "Total", "Paid", "Status", "Date", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" style={{ width: `${30 + Math.random() * 50}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.items
                    .filter(inv => !search || inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || (inv.customer_name ?? "").toLowerCase().includes(search.toLowerCase()))
                    .map((inv, i) => {
                      const status = STATUS_CONFIG[inv.payment_status] ?? STATUS_CONFIG.pending;
                      const StatusIcon = status.icon;
                      const balance = parseFloat(inv.total_amount) - parseFloat(inv.paid_amount);
                      return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (inv.job_card_id) {
                              router.push(`/dashboard/jobs/${inv.job_card_id}`);
                            }
                          }}
                      >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-foreground">{inv.invoice_number}</span>
                          </td>
                          <td className="px-4 py-3 text-foreground">{inv.customer_name ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{inv.vehicle_plate ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-muted-foreground">{inv.job_number ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(inv.total_amount)}</td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-success font-medium">{formatCurrency(inv.paid_amount)}</span>
                              {balance > 0 && (
                                <p className="text-[11px] text-destructive">Due: {formatCurrency(balance)}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", status.class)}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {formatDate(inv.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={`${API_BASE_URL}/pdf/invoice/${inv.id}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
            </tbody>
          </table>

          {!isLoading && data?.items.length === 0 && (
            <EmptyState icon={Receipt} title="No invoices yet" description="Invoices are created from job cards marked as Ready" />
          )}

          {data && data.total > 0 && (
            <Pagination page={page} pages={data.pages} total={data.total} pageSize={data.page_size} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  );
}
