"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQuery as useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity, Search, Filter, User, Clock,
  Shield, LogIn, LogOut, Plus, Pencil, Trash2,
  Package, Receipt, Car, ClipboardList, Wrench,
  ChevronDown, X, Calendar,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { activityLogsApi, type ActivityLog } from "@/lib/api/activity-logs";
import { staffApi } from "@/lib/api/staff";
import { formatDate, cn } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useRouter } from "next/navigation";

// Action → icon + color
const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "user.login":               { icon: LogIn,       color: "text-success",      bg: "bg-success-muted" },
  "user.token_refresh":       { icon: Shield,      color: "text-info",         bg: "bg-info-muted" },
  "customer.created":         { icon: Plus,        color: "text-success",      bg: "bg-success-muted" },
  "customer.updated":         { icon: Pencil,      color: "text-info",         bg: "bg-info-muted" },
  "customer.deleted":         { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
  "vehicle.created":          { icon: Car,         color: "text-success",      bg: "bg-success-muted" },
  "vehicle.updated":          { icon: Pencil,      color: "text-info",         bg: "bg-info-muted" },
  "vehicle.deleted":          { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
  "job_card.created":         { icon: ClipboardList, color: "text-brand-600",  bg: "bg-brand-100 dark:bg-brand-50/10" },
  "job_card.updated":         { icon: Pencil,      color: "text-info",         bg: "bg-info-muted" },
  "job_card.status_changed":  { icon: Wrench,      color: "text-warning",      bg: "bg-warning-muted" },
  "job_card.deleted":         { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
  "invoice.created":          { icon: Receipt,     color: "text-success",      bg: "bg-success-muted" },
  "invoice.payment_recorded": { icon: Receipt,     color: "text-success",      bg: "bg-success-muted" },
  "inventory.part_added":     { icon: Package,     color: "text-brand-600",    bg: "bg-brand-100 dark:bg-brand-50/10" },
  "inventory.part_updated":   { icon: Pencil,      color: "text-info",         bg: "bg-info-muted" },
  "inventory.part_deleted":   { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
  "inventory.stock_adjusted": { icon: Package,     color: "text-warning",      bg: "bg-warning-muted" },
  "gate_pass.issued":         { icon: Shield,      color: "text-success",      bg: "bg-success-muted" },
  "gate_pass.verified":       { icon: Shield,      color: "text-info",         bg: "bg-info-muted" },
  "staff.created":            { icon: User,        color: "text-success",      bg: "bg-success-muted" },
  "staff.updated":            { icon: Pencil,      color: "text-info",         bg: "bg-info-muted" },
  "staff.deleted":            { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
  "staff.password_reset":     { icon: Shield,      color: "text-warning",      bg: "bg-warning-muted" },
  "daybook.entry_created":    { icon: Plus,        color: "text-success",      bg: "bg-success-muted" },
  "daybook.entry_deleted":    { icon: Trash2,      color: "text-destructive",  bg: "bg-destructive/10" },
};

const RESOURCE_TYPES = [
  "user", "customer", "vehicle", "job_card", "invoice",
  "inventory", "gate_pass", "staff", "daybook",
];

function todayStr() { return new Date().toISOString().split("T")[0]; }
function monthStartStr() {
  const d = new Date(); d.setDate(1);
  return d.toISOString().split("T")[0];
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(monthStartStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<Record<string, unknown> | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._logSearch);
    (window as any)._logSearch = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page, debouncedSearch, actionFilter, resourceFilter, userFilter, dateFrom, dateTo],
    queryFn: () => activityLogsApi.list({
      page, page_size: 50,
      search: debouncedSearch || undefined,
      action: actionFilter || undefined,
      resource_type: resourceFilter || undefined,
      user_id: userFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    enabled: isAdmin,
  });

  const { data: staffData } = useQuery({
    queryKey: ["staff", 1, ""],
    queryFn: () => staffApi.list({ page: 1 }),
    enabled: isAdmin,
  });

  const clearFilters = () => {
    setActionFilter(""); setResourceFilter(""); setUserFilter("");
    setDateFrom(monthStartStr()); setDateTo(todayStr());
    setSearch(""); setDebouncedSearch(""); setPage(1);
  };

  const activeFilters = [actionFilter, resourceFilter, userFilter].filter(Boolean).length;

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-foreground font-medium">Access Restricted</p>
            <p className="text-sm text-muted-foreground">Only admins can view activity logs.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Activity Logs" />
      <div className="flex-1 p-6 max-w-[1300px] w-full mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} events recorded
            </p>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by user, action, resource..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9 px-2 rounded-lg border border-border text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="h-9 px-2 rounded-lg border border-border text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
              (activeFilters > 0 || filtersOpen)
                ? "border-brand-500 bg-brand-50/50 dark:bg-brand-50/5 text-brand-700 dark:text-brand-300"
                : "border-border text-muted-foreground hover:bg-muted/60",
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", filtersOpen && "rotate-180")} />
          </button>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Action Type</label>
              <select
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All actions</option>
                {Object.keys(ACTION_CONFIG).map(action => (
                  <option key={action} value={action}>{action.replace(/[._]/g, " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Resource Type</label>
              <select
                value={resourceFilter}
                onChange={e => { setResourceFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All resources</option>
                {RESOURCE_TYPES.map(r => (
                  <option key={r} value={r}>{r.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Staff Member</label>
              <select
                value={userFilter}
                onChange={e => { setUserFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All users</option>
                {staffData?.items.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Logs table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Event", "User", "Resource", "IP", "Time", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" style={{ width: `${35 + Math.random() * 45}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.items.map((log, i) => {
                    const config = ACTION_CONFIG[log.action] ?? {
                      icon: Activity,
                      color: "text-muted-foreground",
                      bg: "bg-muted",
                    };
                    const Icon = config.icon;

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                              <Icon className={cn("w-3.5 h-3.5", config.color)} />
                            </div>
                            <div>
                              <p className="text-xs font-mono font-medium text-foreground">
                                {log.action.replace(/[._]/g, " ")}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                {log.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {log.user_name ? (
                            <div>
                              <p className="text-xs font-medium text-foreground">{log.user_name}</p>
                              <p className="text-[11px] text-muted-foreground capitalize">{log.user_role?.replace("_", " ")}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">System</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {log.resource_type ? (
                            <div>
                              <span className="text-[11px] font-medium bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded capitalize">
                                {log.resource_type.replace("_", " ")}
                              </span>
                              {log.resource_id && (
                                <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 truncate max-w-[100px]">
                                  {log.resource_id}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {log.ip_address ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          <p>{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-[11px] text-muted-foreground/60">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button
                              onClick={() => { setSelectedMetadata(log.metadata as Record<string, unknown>); setMetadataOpen(true); }}
                              className="text-[10px] text-brand-600 hover:text-brand-700 font-medium transition-colors"
                            >
                              Details
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>

          {!isLoading && data?.items.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Activity className="w-8 h-8 opacity-20" />
              <p className="text-sm">No activity found for this filter</p>
            </div>
          )}

          {data && data.total > 0 && (
            <Pagination page={page} pages={data.pages} total={data.total} pageSize={50} onPageChange={setPage} />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={metadataOpen}
        title="Activity Metadata"
        description={
          <pre className="max-h-[50vh] overflow-auto rounded-xl bg-muted/60 p-3 text-[11px] leading-relaxed text-foreground">
            {JSON.stringify(selectedMetadata ?? {}, null, 2)}
          </pre>
        }
        confirmLabel="Close"
        cancelLabel="Dismiss"
        tone="default"
        onClose={() => setMetadataOpen(false)}
        onConfirm={() => setMetadataOpen(false)}
      />
    </div>
  );
}
