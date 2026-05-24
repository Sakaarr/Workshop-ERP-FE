"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  UserCog,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { StaffDrawer } from "@/components/staff/staff-drawer";

import { staffApi, type StaffMember } from "@/lib/api/staff";
import { getInitials, cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";

const ROLE_CONFIG = {
  super_admin: {
    label: "Super Admin",
    class: "bg-destructive/10 text-destructive",
  },
  admin: {
    label: "Admin",
    class:
      "bg-brand-100 dark:bg-brand-50/10 text-brand-700 dark:text-brand-300",
  },
  staff: {
    label: "Staff",
    class: "bg-muted text-muted-foreground",
  },
};

export default function StaffPage() {
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (v: string) => {
    setSearch(v);

    clearTimeout((window as any)._staffSearch);

    (window as any)._staffSearch = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["staff", page, debouncedSearch],
    queryFn: () =>
      staffApi.list({
        page,
        search: debouncedSearch || undefined,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => staffApi.update(id, { is_active }),

    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["staff"] });
    },

    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: staffApi.delete,

    onSuccess: () => {
      toast.success("Staff member removed");
      qc.invalidateQueries({ queryKey: ["staff"] });
    },

    onError: (e: any) => {
      toast.error(
        e?.response?.data?.detail ?? "Failed to delete staff member"
      );
    },
  });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Staff" />

      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Staff Management
            </h1>

            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} team members
            </p>
          </div>

          {(currentUser?.role === "super_admin" ||
            currentUser?.role === "admin") && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-40 rounded-xl"
                />
              ))
            : data?.items.map((member, i) => {
                const role =
                  ROLE_CONFIG[
                    member.role as keyof typeof ROLE_CONFIG
                  ] ?? ROLE_CONFIG.staff;

                const isMe = member.id === currentUser?.id;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5 space-y-4"
                  >
                    {/* Top */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm shrink-0">
                          {getInitials(member.full_name)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-foreground">
                              {member.full_name}
                            </p>

                            {isMe && (
                              <span className="text-[10px] font-medium text-brand-600 bg-brand-100 dark:bg-brand-50/10 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-1 shrink-0",
                          member.is_active
                            ? "text-success"
                            : "text-destructive"
                        )}
                      >
                        {member.is_active ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}

                        <span className="text-[11px] font-medium">
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                          role.class
                        )}
                      >
                        {role.label}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {member.job_count} jobs assigned
                      </span>
                    </div>

                    {/* Actions */}
                    {!isMe &&
                      (currentUser?.role === "super_admin" ||
                        currentUser?.role === "admin") && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({
                                id: member.id,
                                is_active: !member.is_active,
                              })
                            }
                            className={cn(
                              "flex-1 h-7 rounded-lg text-xs font-medium transition-colors border",
                              member.is_active
                                ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                                : "border-success/30 text-success hover:bg-success-muted"
                            )}
                          >
                            {member.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Remove ${member.full_name}?`
                                )
                              ) {
                                deleteMutation.mutate(member.id);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                  </motion.div>
                );
              })}
        </div>

        {/* Empty State */}
        {!isLoading && data?.items.length === 0 && (
          <EmptyState
            icon={UserCog}
            title="No staff members"
            description="Add your first team member"
            action={{
              label: "Add Staff",
              onClick: () => setDrawerOpen(true),
            }}
          />
        )}

        {/* Pagination */}
        {data && data.total > 20 && (
          <Pagination
            page={page}
            pages={data.pages}
            total={data.total}
            pageSize={data.page_size}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Staff Drawer */}
      <StaffDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}