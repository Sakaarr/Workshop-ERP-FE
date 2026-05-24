"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserCog, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { staffApi } from "@/lib/api/staff";
import { permissionsApi } from "@/lib/api/permissions";
import { cn } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff"]),
  password: z.string().min(8, "Minimum 8 characters"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function StaffDrawer({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "permissions">("form");

  const { data: availablePerms } = useQuery({
    queryKey: ["permissions-available"],
    queryFn: permissionsApi.available,
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "staff" },
  });

  const role = watch("role");

  useEffect(() => {
    if (open) {
      reset({ role: "staff" });
      setSelectedPerms([]);
      setStep("form");
      setCreatedUserId(null);
    }
  }, [open, reset]);
  type CreateStaffPayload = {
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff";
  password: string;
};

  const createMutation = useMutation({
    mutationFn: (data: CreateStaffPayload) =>staffApi.create(data),
    onSuccess: async (user) => {
      if (role === "staff") {
        setCreatedUserId(user.id);
        setStep("permissions");
      } else {
        toast.success("Staff member created");
        qc.invalidateQueries({ queryKey: ["staff"] });
        onClose();
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to create staff"),
  });

  const permMutation = useMutation({
    mutationFn: () => permissionsApi.setForUser(createdUserId!, selectedPerms),
    onSuccess: () => {
      toast.success("Staff member created with permissions");
      qc.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: () => toast.error("Failed to set permissions"),
  });

  const toggleModule = (moduleName: string, modulePerms: string[]) => {
    const allSelected = modulePerms.every(p => selectedPerms.includes(p));
    if (allSelected) {
      setSelectedPerms(prev => prev.filter(p => !modulePerms.includes(p)));
    } else {
      setSelectedPerms(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const selectAll = () => {
    const allPerms = Object.values(availablePerms?.modules ?? {}).flat();
    setSelectedPerms(allPerms);
  };

  const clearAll = () => setSelectedPerms([]);

  const ic = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

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
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {step === "form" ? "Add Staff Member" : "Set Permissions"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {step === "form" ? "Create a new team member account" : "Choose what this staff member can access"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            {role === "staff" && (
              <div className="flex items-center px-6 py-3 border-b border-border gap-3 shrink-0">
                {["Account Details", "Permissions"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && <div className="w-8 h-px bg-border" />}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                        (step === "form" && i === 0) || (step === "permissions" && i === 1)
                          ? "bg-foreground text-background"
                          : step === "permissions" && i === 0
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground",
                      )}>
                        {step === "permissions" && i === 0 ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={cn("text-xs font-medium", (step === "form" && i === 0) || (step === "permissions" && i === 1) ? "text-foreground" : "text-muted-foreground")}>
                        {s}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Form */}
            {step === "form" && (
              <form className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                  <input {...register("full_name")} placeholder="e.g. Ram Prasad Sharma" className={ic(!!errors.full_name)} />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <input {...register("email")} type="email" placeholder="staff@autogarden.com.np" className={ic(!!errors.email)} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <input {...register("phone")} placeholder="98XXXXXXXX" className={ic(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Role *</label>
                  <select {...register("role")} className={ic(false)}>
                    <option value="staff">Staff — Custom permissions</option>
                    <option value="admin">Admin — Full access</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    {role === "admin"
                      ? "Admins get full access to all modules automatically."
                      : "You'll set granular module permissions in the next step."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Password *</label>
                  <input {...register("password")} type="password" placeholder="Min. 8 characters" className={ic(!!errors.password)} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              </form>
            )}

            {/* Step 2: Permissions */}
            {step === "permissions" && availablePerms && (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedPerms.length}</span> permissions selected
                  </p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">Select All</button>
                    <span className="text-muted-foreground">·</span>
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                  </div>
                </div>

                {Object.entries(availablePerms.modules).map(([moduleName, modulePerms]) => {
                  const allSelected = modulePerms.every(p => selectedPerms.includes(p));
                  const someSelected = modulePerms.some(p => selectedPerms.includes(p));
                  const expanded = expandedModules.includes(moduleName);

                  return (
                    <div key={moduleName} className="border border-border rounded-xl overflow-hidden">
                      <div
                        className={cn(
                          "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                          allSelected ? "bg-brand-50/50 dark:bg-brand-50/5" : "hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1" onClick={() => toggleModule(moduleName, modulePerms)}>
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                            allSelected
                              ? "bg-brand-500 border-brand-500"
                              : someSelected
                              ? "bg-brand-200 border-brand-400 dark:bg-brand-800 dark:border-brand-600"
                              : "border-border",
                          )}>
                            {allSelected && <Check className="w-3 h-3 text-white" />}
                            {someSelected && !allSelected && <div className="w-2 h-0.5 bg-brand-600 dark:bg-brand-400 rounded" />}
                          </div>
                          <span className="text-sm font-medium text-foreground">{moduleName}</span>
                          <span className="text-xs text-muted-foreground">
                            ({modulePerms.filter(p => selectedPerms.includes(p)).length}/{modulePerms.length})
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedModules(prev =>
                            prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
                          )}
                          className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-1.5 border-t border-border bg-muted/20">
                              {modulePerms.map(perm => {
                                const permLabel = perm.split(".")[1]?.replace("_", " ");
                                const isChecked = selectedPerms.includes(perm);
                                return (
                                  <button
                                    key={perm}
                                    onClick={() => togglePerm(perm)}
                                    className={cn(
                                      "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all text-left",
                                      isChecked
                                        ? "bg-brand-100 dark:bg-brand-50/10 text-brand-700 dark:text-brand-300 font-medium"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                    )}
                                  >
                                    <div className={cn(
                                      "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                                      isChecked ? "bg-brand-500 border-brand-500" : "border-border",
                                    )}>
                                      {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="capitalize">{permLabel}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button
                onClick={() => {
                  if (step === "permissions") setStep("form");
                  else onClose();
                }}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                {step === "permissions" ? "← Back" : "Cancel"}
              </button>

              {step === "form" && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit((d) =>
                    createMutation.mutate({
                        full_name: d.full_name,
                        email: d.email,
                        phone: d.phone,
                        role: d.role,
                        password: d.password,
                    })
                    )}
                  disabled={createMutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {role === "staff" ? "Next: Set Permissions →" : "Create Admin"}
                </motion.button>
              )}

              {step === "permissions" && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => permMutation.mutate()}
                  disabled={permMutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {permMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Staff Member
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}