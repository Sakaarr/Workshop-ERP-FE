"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Car, User, Clock, Wrench, Package, CheckCircle2,
  ChevronRight, FileText, Pencil, Plus, Loader2, AlertCircle,
  Receipt, X, Shield, Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { jobCardsApi, type JobStatus } from "@/lib/api/job-cards";
import { invoicesApi } from "@/lib/api/invoices";
import { customersApi } from "@/lib/api/customers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { InvoicePanel } from "@/components/billing/invoice-panel";
import { gatePassApi } from "@/lib/api/gate-pass";
import { apiClient } from "@/lib/api/client";

async function openPdf(path: string) {
  const tab = window.open("about:blank", "_blank", "noreferrer");
  const response = await apiClient.get(path, { responseType: "blob" });
  const pdfUrl = URL.createObjectURL(response.data);
  if (tab) {
    tab.location.href = pdfUrl;
  } else {
    window.open(pdfUrl, "_blank", "noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
}

// ── Status workflow config ──────────────────────────────────
const STATUS_STEPS: { key: JobStatus; label: string; icon: React.ElementType }[] = [
  { key: "waiting",       label: "Waiting",      icon: Clock },
  { key: "diagnosing",    label: "Diagnosing",   icon: Wrench },
  { key: "repairing",     label: "Repairing",    icon: Wrench },
  { key: "waiting_parts", label: "Needs Parts",  icon: Package },
  { key: "ready",         label: "Ready",        icon: CheckCircle2 },
  { key: "delivered",     label: "Delivered",    icon: CheckCircle2 },
];

const STATUS_COLOR: Record<JobStatus, string> = {
  waiting:       "text-warning bg-warning-muted",
  diagnosing:    "text-info bg-info-muted",
  repairing:     "text-brand-700 bg-brand-100 dark:text-brand-300 dark:bg-brand-50/10",
  waiting_parts: "text-warning bg-warning-muted",
  ready:         "text-success bg-success-muted",
  delivered:     "text-muted-foreground bg-muted",
  cancelled:     "text-destructive bg-destructive/10",
};

const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  waiting:       "diagnosing",
  diagnosing:    "repairing",
  repairing:     "ready",
  waiting_parts: "repairing",
  ready:         "delivered",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const qc = useQueryClient();
  const [invoicePanelOpen, setInvoicePanelOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-cards", jobId],
    queryFn: () => jobCardsApi.get(jobId!),
    enabled: !!jobId,
  });

  const { data: invoice } = useQuery({
    queryKey: ["invoices", "by-job", jobId],
    queryFn: () => invoicesApi.getByJob(jobId!),
    enabled: !!jobId,
  });

  const { data: customer } = useQuery({
    queryKey: ["customers", job?.customer_id],
    queryFn: () => customersApi.get(job!.customer_id),
    enabled: !!job?.customer_id,
  });

  const { data: vehicle } = useQuery({
    queryKey: ["vehicles", job?.vehicle_id],
    queryFn: () => vehiclesApi.get(job!.vehicle_id),
    enabled: !!job?.vehicle_id,
  });

  // ── Gate pass ──────────────────────────────────────────────
  const { data: gatePass } = useQuery({
    queryKey: ["gate-passes", "by-invoice", invoice?.id],
    queryFn: () => gatePassApi.getByInvoice(invoice!.id),
    enabled: !!invoice?.id,
  });

  const gatePassMutation = useMutation({
    mutationFn: () => gatePassApi.create(invoice!.id, job!.id),
    onSuccess: () => {
      toast.success("Gate pass issued!");
      qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to issue gate pass"),
  });

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => jobCardsApi.updateStatus(jobId!, status),
    onSuccess: (updated) => {
      toast.success(`Status updated to ${updated.status.replace("_", " ")}`);
      qc.invalidateQueries({ queryKey: ["job-cards"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { diagnosis?: string; internal_notes?: string }) =>
      jobCardsApi.update(jobId!, data),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["job-cards", jobId] });
      setEditingNotes(false);
      setEditingDiagnosis(false);
    },
    onError: () => toast.error("Update failed"),
  });

  if (!jobId || isLoading || !job) {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar />
        <div className="p-6 space-y-4 max-w-[1200px] mx-auto w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[job.status as JobStatus];
  const canCreateInvoice = job.status === "ready" && !invoice;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-5">

        {/* Back */}
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Cards
        </button>

        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-brand-700 dark:text-brand-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground font-mono">{job.job_number}</h1>
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", STATUS_COLOR[job.status as JobStatus])}>
                  {job.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Created {formatDate(job.created_at, "long")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Print Job Card */}
            <button
              onClick={() => { void openPdf(`/pdf/job-card/${job.id}`); }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/60 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="w-4 h-4" /> Print Job Card
            </button>

            {canCreateInvoice && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setInvoicePanelOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Receipt className="w-4 h-4" /> Generate Invoice
              </motion.button>
            )}

            {invoice && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setInvoicePanelOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/60 text-sm font-medium transition-colors"
              >
                <Receipt className="w-4 h-4" /> View Invoice
              </motion.button>
            )}

            {invoice && !gatePass && invoice.payment_status !== "pending" && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => gatePassMutation.mutate()}
                disabled={gatePassMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {gatePassMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Issue Gate Pass
              </motion.button>
            )}

            {gatePass && (
              <button
                onClick={() => { void openPdf(`/pdf/gate-pass/${gatePass.id}`); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" /> Gate Pass PDF
              </button>
            )}

            {nextStatus && job.status !== "delivered" && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => statusMutation.mutate(nextStatus)}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60"
              >
                {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Mark as {nextStatus.replace("_", " ")}
              </motion.button>
            )}
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progress</h2>
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {STATUS_STEPS.filter(s => s.key !== "delivered" || job.status === "delivered").map((step, i, arr) => {
              const statusOrder = ["waiting", "diagnosing", "repairing", "waiting_parts", "ready", "delivered"];
              const currentIdx = statusOrder.indexOf(job.status);
              const stepIdx = statusOrder.indexOf(step.key);
              const isDone = stepIdx < currentIdx;
              const isCurrent = step.key === job.status;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                      isDone ? "bg-success border-success text-success-foreground"
                        : isCurrent ? "bg-brand-500 border-brand-500 text-white"
                        : "bg-background border-border text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      isCurrent ? "text-foreground" : isDone ? "text-success" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-8 sm:w-12 mx-1 mb-4 shrink-0 transition-colors",
                      statusOrder.indexOf(arr[i + 1].key) <= currentIdx ? "bg-success" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — vehicle + customer */}
          <div className="space-y-4">

            {/* Vehicle card */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Vehicle</h3>
              {vehicle ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{vehicle.plate_number}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <StatChip label="Fuel" value={vehicle.fuel_type} />
                    <StatChip label="Odometer In" value={`${job.odometer_in.toLocaleString()} km`} />
                    {vehicle.color && <StatChip label="Color" value={vehicle.color} />}
                  </div>
                </div>
              ) : <div className="skeleton h-16 rounded" />}
            </motion.div>

            {/* Customer card */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Customer</h3>
              {customer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                      className="text-sm font-medium text-foreground hover:text-brand-600 transition-colors"
                    >
                      {customer.name}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.phone_primary}</p>
                  {customer.city && <p className="text-xs text-muted-foreground">{customer.city}</p>}
                </div>
              ) : <div className="skeleton h-12 rounded" />}
            </motion.div>

            {/* Cost summary */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Cost Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated</span>
                  <span className="font-medium text-foreground">{formatCurrency(job.estimated_cost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labour</span>
                  <span className="font-medium text-foreground">{formatCurrency(job.labor_charge)}</span>
                </div>
                {invoice && (
                  <>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-foreground">Invoice Total</span>
                        <span className="text-foreground">{formatCurrency(invoice.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Paid</span>
                        <span className={parseFloat(invoice.paid_amount) >= parseFloat(invoice.total_amount) ? "text-success font-medium" : "text-warning font-medium"}>
                          {formatCurrency(invoice.paid_amount)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right — complaint, diagnosis, notes */}
          <div className="lg:col-span-2 space-y-4">

            {/* Complaint */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Customer Complaint</h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.complaint}</p>
            </motion.div>

            {/* Diagnosis */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Diagnosis</h3>
                {!editingDiagnosis && (
                  <button
                    onClick={() => { setDiagnosis(job.diagnosis ?? ""); setEditingDiagnosis(true); }}
                    className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> {job.diagnosis ? "Edit" : "Add"}
                  </button>
                )}
              </div>

              {editingDiagnosis ? (
                <div className="space-y-3">
                  <textarea
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder="Describe the diagnosis..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingDiagnosis(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/60 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ diagnosis })}
                      disabled={updateMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center gap-1"
                    >
                      {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : job.diagnosis ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.diagnosis}</p>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm italic">No diagnosis recorded yet</p>
                </div>
              )}
            </motion.div>

            {/* Internal notes */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Internal Notes</h3>
                {!editingNotes && (
                  <button
                    onClick={() => { setNotes(job.internal_notes ?? ""); setEditingNotes(true); }}
                    className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> {job.internal_notes ? "Edit" : "Add"}
                  </button>
                )}
              </div>

              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Internal notes for staff..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingNotes(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/60 transition-colors">Cancel</button>
                    <button
                      onClick={() => updateMutation.mutate({ internal_notes: notes })}
                      disabled={updateMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center gap-1"
                    >
                      {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : job.internal_notes ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.internal_notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">No internal notes</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invoice panel */}
      <InvoicePanel
        open={invoicePanelOpen}
        onClose={() => setInvoicePanelOpen(false)}
        job={job}
        invoice={invoice ?? null}
      />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}
