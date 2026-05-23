"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { customersApi, type Customer } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone_primary: z.string().min(7, "Valid phone required"),
  phone_secondary: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  pan_vat: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerDrawer({ open, onClose, customer }: Props) {
  const qc = useQueryClient();
  const isEdit = !!customer;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(customer ? {
        name: customer.name,
        phone_primary: customer.phone_primary,
        phone_secondary: customer.phone_secondary ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
        city: customer.city ?? "",
        pan_vat: customer.pan_vat ?? "",
        notes: customer.notes ?? "",
      } : { name: "", phone_primary: "", phone_secondary: "", email: "", address: "", city: "", pan_vat: "", notes: "" });
    }
  }, [open, customer, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, email: data.email || undefined, phone_secondary: data.phone_secondary || undefined };
      return isEdit ? customersApi.update(customer!.id, payload) : customersApi.create(payload as any);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Customer updated" : "Customer created");
      qc.invalidateQueries({ queryKey: ["customers"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Something went wrong"),
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-card border-l border-border shadow-dialog flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {isEdit ? "Edit Customer" : "New Customer"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEdit ? `Editing ${customer?.name}` : "Add a new customer profile"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <FormField label="Full Name" error={errors.name?.message} required>
                <input {...register("name")} placeholder="e.g. Ram Prasad Sharma" className={inputCls(!!errors.name)} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Primary Phone" error={errors.phone_primary?.message} required>
                  <input {...register("phone_primary")} placeholder="98XXXXXXXX" className={inputCls(!!errors.phone_primary)} />
                </FormField>
                <FormField label="Secondary Phone">
                  <input {...register("phone_secondary")} placeholder="98XXXXXXXX" className={inputCls(false)} />
                </FormField>
              </div>

              <FormField label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="customer@example.com" className={inputCls(!!errors.email)} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="City">
                  <input {...register("city")} placeholder="e.g. Bharatpur" className={inputCls(false)} />
                </FormField>
                <FormField label="PAN / VAT">
                  <input {...register("pan_vat")} placeholder="PAN number" className={inputCls(false)} />
                </FormField>
              </div>

              <FormField label="Address">
                <textarea {...register("address")} rows={2} placeholder="Full address..." className={cn(inputCls(false), "resize-none")} />
              </FormField>

              <FormField label="Notes">
                <textarea {...register("notes")} rows={2} placeholder="Internal notes..." className={cn(inputCls(false), "resize-none")} />
              </FormField>
            </form>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit(d => mutation.mutate(d))}
                disabled={mutation.isPending}
                className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Customer"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors",
    hasError ? "border-destructive" : "border-border hover:border-border/80"
  );
}