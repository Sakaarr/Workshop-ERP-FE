"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { invoicesApi, type Invoice, type PaymentMethod } from "@/lib/api/invoices";
import type { JobCard } from "@/lib/api/job-cards";
import { formatCurrency, cn } from "@/lib/utils";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "fonepay", label: "FonePay" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "credit", label: "Credit" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "text-warning bg-warning-muted",
  partial: "text-info bg-info-muted",
  paid: "text-success bg-success-muted",
  cancelled: "text-destructive bg-destructive/10",
};

const createSchema = z.object({
  discount_amount: z.string().optional(),
  discount_reason: z.string().optional(),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "esewa", "khalti", "fonepay", "credit"]).optional(),
  paid_amount: z.string().optional(),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.string().min(1, "Amount required"),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "esewa", "khalti", "fonepay", "credit"]),
  notes: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  job: JobCard;
  invoice: Invoice | null;
}

export function InvoicePanel({ open, onClose, job, invoice }: Props) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"invoice" | "payment">("invoice");

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const paymentForm = useForm<PaymentForm>({ resolver: zodResolver(paymentSchema) });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) =>
      invoicesApi.createFromJob(job.id, {
        customer_id: job.customer_id,
        discount_amount: data.discount_amount || "0",
        discount_reason: data.discount_reason || undefined,
        payment_method: data.payment_method,
        paid_amount: data.paid_amount || "0",
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Invoice generated");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["job-cards"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to create invoice"),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: PaymentForm) =>
      invoicesApi.recordPayment(invoice!.id, data.amount, data.payment_method, data.notes),
    onSuccess: () => {
      toast.success("Payment recorded");
      paymentForm.reset();
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to record payment"),
  });

  const inputCls = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

  const balance = invoice
    ? parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount)
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] bg-card border-l border-border shadow-dialog flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-muted flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-success" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {invoice ? invoice.invoice_number : "Generate Invoice"}
                  </h2>
                  <p className="text-xs text-muted-foreground">Job {job.job_number}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs — only when invoice exists */}
            {invoice && (
              <div className="flex border-b border-border px-6 shrink-0">
                {(["invoice", "payment"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors",
                      activeTab === tab
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "payment" ? "Record Payment" : "Invoice"}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* ── Invoice view ── */}
              {(!invoice || activeTab === "invoice") && (
                <div className="space-y-5">
                  {/* If no invoice yet — creation form */}
                  {!invoice && (
                    <form className="space-y-4">
                      <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Job Summary</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Labour Charge</span>
                          <span className="font-medium text-foreground">{formatCurrency(job.labor_charge)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Parts</span>
                          <span className="font-medium text-foreground">{formatCurrency(job.estimated_cost)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Discount (NPR)</label>
                          <input {...createForm.register("discount_amount")} type="number" placeholder="0.00" className={inputCls(false)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Discount Reason</label>
                          <input {...createForm.register("discount_reason")} placeholder="Loyalty, etc." className={inputCls(false)} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                        <select {...createForm.register("payment_method")} className={inputCls(false)}>
                          <option value="">Select method...</option>
                          {PAYMENT_METHODS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Amount Paid Now (NPR)</label>
                        <input {...createForm.register("paid_amount")} type="number" placeholder="0.00" className={inputCls(false)} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Notes</label>
                        <textarea {...createForm.register("notes")} rows={2} placeholder="Optional notes..." className={cn(inputCls(false), "h-auto resize-none py-2")} />
                      </div>
                    </form>
                  )}

                  {/* If invoice exists — show breakdown */}
                  {invoice && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", STATUS_STYLE[invoice.payment_status])}>
                          {invoice.payment_status}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(invoice.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
                        <LineItem label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                        {parseFloat(invoice.discount_amount) > 0 && (
                          <LineItem label={`Discount${invoice.discount_reason ? ` (${invoice.discount_reason})` : ""}`} value={`-${formatCurrency(invoice.discount_amount)}`} className="text-success" />
                        )}
                        <LineItem label="Taxable Amount" value={formatCurrency(invoice.taxable_amount)} />
                        <LineItem label={`VAT (${invoice.tax_rate}%)`} value={formatCurrency(invoice.tax_amount)} />
                        <div className="border-t border-border pt-2">
                          <LineItem label="Total" value={formatCurrency(invoice.total_amount)} bold />
                          <LineItem label="Paid" value={formatCurrency(invoice.paid_amount)} className="text-success" />
                          {balance > 0 && <LineItem label="Balance Due" value={formatCurrency(balance)} className="text-destructive" bold />}
                        </div>
                      </div>

                      {invoice.payment_method && (
                        <p className="text-xs text-muted-foreground">
                          Payment via <span className="font-medium capitalize text-foreground">{invoice.payment_method.replace("_", " ")}</span>
                        </p>
                      )}

                      {invoice.notes && (
                        <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">{invoice.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Record payment tab ── */}
              {invoice && activeTab === "payment" && (
                <form className="space-y-4" onSubmit={paymentForm.handleSubmit(d => paymentMutation.mutate(d))}>
                  <div className="bg-muted/40 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className={cn("font-bold", balance > 0 ? "text-destructive" : "text-success")}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Amount (NPR) <span className="text-destructive">*</span></label>
                    <input
                      {...paymentForm.register("amount")}
                      type="number"
                      placeholder={balance.toFixed(2)}
                      className={inputCls(!!paymentForm.formState.errors.amount)}
                    />
                    {paymentForm.formState.errors.amount && <p className="text-xs text-destructive">{paymentForm.formState.errors.amount.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Payment Method <span className="text-destructive">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map(m => (
                        <label
                          key={m.value}
                          className={cn(
                            "flex items-center justify-center px-2 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-all",
                            paymentForm.watch("payment_method") === m.value
                              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-50/5 text-brand-700 dark:text-brand-300"
                              : "border-border text-muted-foreground hover:border-border/60 hover:bg-muted/30",
                          )}
                        >
                          <input {...paymentForm.register("payment_method")} type="radio" value={m.value} className="sr-only" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                    {paymentForm.formState.errors.payment_method && <p className="text-xs text-destructive">Select a method</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Notes</label>
                    <input {...paymentForm.register("notes")} placeholder="Transaction reference, etc." className={inputCls(false)} />
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">
                {invoice && activeTab === "invoice" ? "Close" : "Cancel"}
              </button>

              {!invoice && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={createForm.handleSubmit(d => createMutation.mutate(d))}
                  disabled={createMutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Receipt className="w-4 h-4" /> Generate Invoice
                </motion.button>
              )}

              {invoice && activeTab === "payment" && balance > 0 && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={paymentForm.handleSubmit(d => paymentMutation.mutate(d))}
                  disabled={paymentMutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Record Payment
                </motion.button>
              )}

              {invoice && invoice.payment_status === "paid" && activeTab === "invoice" && (
                <div className="flex-1 h-10 rounded-lg bg-success-muted text-success flex items-center justify-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Fully Paid
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LineItem({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold ? "font-bold text-foreground" : "font-medium text-foreground", className)}>{value}</span>
    </div>
  );
}