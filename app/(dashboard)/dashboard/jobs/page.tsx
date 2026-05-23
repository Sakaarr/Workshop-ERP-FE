"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search, ClipboardList, Car, User, Clock, CheckCircle2, Wrench, Package, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { jobCardsApi, type JobStatus, type JobCardListItem } from "@/lib/api/job-cards";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const STATUSES: { value: JobStatus | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Jobs", icon: ClipboardList },
  { value: "waiting", label: "Waiting", icon: Clock },
  { value: "diagnosing", label: "Diagnosing", icon: Search },
  { value: "repairing", label: "Repairing", icon: Wrench },
  { value: "waiting_parts", label: "Needs Parts", icon: Package },
  { value: "ready", label: "Ready", icon: CheckCircle2 },
  { value: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_STYLE: Record<string, { dot: string; badge: string }> = {
  waiting:       { dot: "bg-warning", badge: "badge-waiting" },
  diagnosing:    { dot: "bg-info", badge: "badge-diagnosing" },
  repairing:     { dot: "bg-brand-500", badge: "badge-repairing" },
  waiting_parts: { dot: "bg-warning", badge: "badge-waiting" },
  ready:         { dot: "bg-success", badge: "badge-ready" },
  delivered:     { dot: "bg-muted-foreground", badge: "badge-delivered" },
  cancelled:     { dot: "bg-destructive", badge: "badge-cancelled" },
};

export default function JobCardsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._jobSearchTimer);
    (window as any)._jobSearchTimer = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["job-cards", page, debouncedSearch, statusFilter],
    queryFn: () => jobCardsApi.list({
      page,
      page_size: 20,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Job Cards" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Job Cards</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} total jobs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard/jobs/new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Job Card
          </motion.button>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STATUSES.map(s => {
            const Icon = s.icon;
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1); }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search job number or complaint..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Jobs list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Job #", "Customer", "Vehicle", "Complaint", "Assigned", "Status", "Cost", "Date", ""].map(h => (
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
                : data?.items.map((job, i) => {
                    const style = STATUS_STYLE[job.status] ?? STATUS_STYLE.waiting;
                    return (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-foreground">{job.job_number}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate max-w-[120px]">{job.customer_name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground text-xs">{job.vehicle_plate ?? "—"}</p>
                              <p className="text-muted-foreground text-[11px]">{job.vehicle_brand} {job.vehicle_model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="truncate text-foreground">{job.complaint}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {job.assigned_to_name ?? <span className="text-muted-foreground/40">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", style.badge)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                            {job.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium text-xs">
                          {formatCurrency(job.estimated_cost)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(job.created_at, "relative")}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>

          {!isLoading && data?.items.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No job cards found"
              description={statusFilter !== "all" ? `No jobs with status "${statusFilter}"` : "Create your first job card to get started"}
              action={{ label: "New Job Card", onClick: () => router.push("/dashboard/jobs/new") }}
            />
          )}

          {data && data.total > 0 && (
            <Pagination page={page} pages={data.pages} total={data.total} pageSize={data.page_size} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  );
}