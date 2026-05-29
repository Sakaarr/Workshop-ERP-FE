"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2,
  ChevronLeft, ChevronRight, BookOpen, Loader2, Square, CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  daybookApi, type DayBookEntryCreate,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from "@/lib/api/daybook";
import { formatCurrency, cn } from "@/lib/utils";

const schema = z.object({
  entry_type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount required"),
  description: z.string().min(2, "Description required"),
  category: z.string().min(1, "Category required"),
});

type FormData = z.infer<typeof schema>;

function todayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-NP", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function shiftDate(d: string, days: number): string {
  const [year, month, day] = d.split("-").map(Number);
  const dt = new Date(year, month - 1, day);
  dt.setDate(dt.getDate() + days);
  const nextYear = dt.getFullYear();
  const nextMonth = String(dt.getMonth() + 1).padStart(2, "0");
  const nextDay = String(dt.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export default function DayBookPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayStr());
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const today = todayStr();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["daybook-summary", date],
    queryFn: () => daybookApi.summary(date),
  });

  const selectedCount = selectedIds.length;
  const allSelected = (summary?.entries.length ?? 0) > 0 && (summary?.entries ?? []).every(entry => selectedIds.includes(entry.id));

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { entry_type: "income" },
  });

  const entryType = watch("entry_type");
  const categories = entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const createMutation = useMutation({
    mutationFn: (data: FormData) => daybookApi.create({
      ...data,
      entry_date: date,
    } as DayBookEntryCreate),
    onSuccess: () => {
      toast.success("Entry added");
      qc.invalidateQueries({ queryKey: ["daybook-summary", date] });
      reset({ entry_type: entryType, amount: "", description: "", category: "" });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => daybookApi.delete(id),
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: ["daybook-summary", date] });
      setSelectedIds([]);
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: daybookApi.bulkDelete,
    onSuccess: () => {
      toast.success("Entries deleted");
      qc.invalidateQueries({ queryKey: ["daybook-summary", date] });
      setSelectedIds([]);
    },
    onError: () => toast.error("Failed to delete entries"),
  });

  const income = parseFloat(summary?.total_income ?? "0");
  const expense = parseFloat(summary?.total_expense ?? "0");
  const net = income - expense;

  const inputCls = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Day Book" />

      <div className="flex-1 p-6 max-w-[1000px] w-full mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Day Book</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Daily cash flow & expense tracking</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </motion.button>
        </div>

        {selectedCount > 0 && (
          <button
            onClick={() => setDeleteTarget(selectedIds[0])}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/15 transition-colors"
          >
            Delete Selected ({selectedCount})
          </button>
        )}

        {/* Date navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDate(d => shiftDate(d, -1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-[13px] font-semibold text-foreground">{formatDisplayDate(date)}</p>
            {date === today && (
              <span className="text-xs text-brand-600 font-medium">Today</span>
            )}
          </div>

          <button
            onClick={() => setDate(d => shiftDate(d, 1))}
            disabled={date >= today}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {date !== today && (
            <button
              onClick={() => setDate(today)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              Today
            </button>
          )}

          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Income", value: income, icon: TrendingUp, color: "text-success", bg: "bg-success-muted" },
            { label: "Expenses", value: expense, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Net", value: net, icon: DollarSign, color: net >= 0 ? "text-success" : "text-destructive", bg: net >= 0 ? "bg-success-muted" : "bg-destructive/10" },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", card.bg)}>
                  <Icon className={cn("w-4.5 h-4.5", card.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={cn("text-lg font-bold", card.color)}>{formatCurrency(card.value)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add entry form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit(d => createMutation.mutate(d))}
                className="bg-card border border-border rounded-xl p-5 space-y-4"
              >
                <h3 className="text-sm font-semibold text-foreground">New Entry</h3>

                {/* Type toggle */}
                <div className="flex gap-2">
                  {(["income", "expense"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setValue("entry_type", type); setValue("category", ""); }}
                      className={cn(
                        "flex-1 h-9 rounded-lg text-sm font-medium capitalize transition-all border",
                        entryType === type
                          ? type === "income"
                            ? "bg-success-muted text-success border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                          : "border-border text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      {type === "income" ? <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" /> : <TrendingDown className="w-3.5 h-3.5 inline mr-1.5" />}
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Amount (NPR) *</label>
                    <input {...register("amount")} type="number" step="0.01" placeholder="0.00" className={inputCls(!!errors.amount)} />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Category *</label>
                    <select {...register("category")} className={inputCls(!!errors.category)}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description *</label>
                  <input {...register("description")} placeholder="What is this for?" className={inputCls(!!errors.description)} />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Entry
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground">
              Entries <span className="text-muted-foreground font-normal">({summary?.entries.length ?? 0})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="skeleton h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                  <div className="skeleton h-5 w-24 rounded" />
                </div>
              ))}
            </div>
          ) : summary?.entries.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-3 text-muted-foreground">
              <BookOpen className="w-8 h-8 opacity-30" />
              <p className="text-sm">No entries for this date</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Add the first entry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {summary?.entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedIds(current => current.includes(entry.id) ? current.filter(id => id !== entry.id) : [...current, entry.id])}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Select ${entry.description}`}
                  >
                    {selectedIds.includes(entry.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    entry.entry_type === "income" ? "bg-success-muted" : "bg-destructive/10",
                  )}>
                    {entry.entry_type === "income"
                      ? <TrendingUp className="w-3.5 h-3.5 text-success" />
                      : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">{entry.category}</span>
                      {entry.created_by_name && (
                        <span className="text-[11px] text-muted-foreground">{entry.created_by_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      entry.entry_type === "income" ? "text-success" : "text-destructive",
                    )}>
                      {entry.entry_type === "income" ? "+" : "−"}{formatCurrency(entry.amount)}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(entry.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer totals */}
          {summary && summary.entries.length > 0 && (
            <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{summary.entries.length} entries</span>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs">In:</span>
                  <span className="text-success font-semibold">{formatCurrency(income)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs">Out:</span>
                  <span className="text-destructive font-semibold">{formatCurrency(expense)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs">Net:</span>
                  <span className={cn("font-bold", net >= 0 ? "text-success" : "text-destructive")}>
                    {net >= 0 ? "+" : ""}{formatCurrency(net)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title={selectedCount > 1 ? `Delete ${selectedCount} entries?` : "Delete this entry?"}
        description={selectedCount > 1
          ? "This will permanently remove the selected daybook entries."
          : "This will permanently remove the daybook entry."}
        confirmLabel="Delete"
        loading={deleteMutation.isPending || bulkDeleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (selectedCount > 1) {
            bulkDeleteMutation.mutate(selectedIds);
          } else if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
