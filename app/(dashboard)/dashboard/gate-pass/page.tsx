"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, CheckCircle2, Car, User, Download, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { gatePassApi } from "@/lib/api/gate-pass";
import { apiClient } from "@/lib/api/client";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const API_BASE_URL = (apiClient.defaults.baseURL ?? "").replace(/\/$/, "");

export default function GatePassPage() {
  const qc = useQueryClient();
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const { data: passes, isLoading } = useQuery({
    queryKey: ["gate-passes"],
    queryFn: gatePassApi.list,
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => gatePassApi.verify(code),
    onSuccess: (result) => {
      setVerifyResult(result);
      toast.success("Gate pass verified! Vehicle may exit.");
      qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "Invalid gate pass");
      setVerifyResult(null);
    },
  });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Gate Pass" />
      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-6">

        <div>
          <h1 className="text-xl font-bold text-foreground">Gate Pass System</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verify and manage vehicle exit passes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification panel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-700 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">Verify Exit</h2>
                <p className="text-xs text-muted-foreground">Enter or scan the gate pass code</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && verifyCode && verifyMutation.mutate(verifyCode)}
                  placeholder="GP-XXXXXXXX"
                  className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring uppercase tracking-widest"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => verifyCode && verifyMutation.mutate(verifyCode)}
                  disabled={verifyMutation.isPending || !verifyCode}
                  className="px-5 h-11 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Verify
                </motion.button>
              </div>

              {/* Result card */}
              <AnimatePresence mode="wait">
                {verifyResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-success-muted border border-success/20 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold text-success">Verified — Vehicle Cleared to Exit</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Customer: </span><span className="font-medium text-foreground">{verifyResult.customer_name}</span></div>
                      <div><span className="text-muted-foreground">Vehicle: </span><span className="font-medium text-foreground">{verifyResult.vehicle_plate}</span></div>
                      <div><span className="text-muted-foreground">Invoice: </span><span className="font-medium text-foreground">{verifyResult.invoice_number}</span></div>
                      <div><span className="text-muted-foreground">Amount: </span><span className="font-medium text-foreground">NPR {verifyResult.total_amount}</span></div>
                    </div>
                    <button
                      onClick={() => { setVerifyResult(null); setVerifyCode(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h2 className="text-[14px] font-semibold text-foreground">Active Passes</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Pending Exit</p>
                <p className="text-2xl font-bold text-foreground mt-1">{passes?.filter(p => !p.is_used).length ?? 0}</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Used Today</p>
                <p className="text-2xl font-bold text-success mt-1">{passes?.filter(p => p.is_used).length ?? 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active passes list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">All Gate Passes</h2>
            <span className="text-xs text-muted-foreground">{passes?.length ?? 0} total</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="skeleton h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : passes?.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">No gate passes issued yet</div>
          ) : (
            <div className="divide-y divide-border">
              {passes?.map((gp, i) => (
                <motion.div
                  key={gp.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    gp.is_used ? "bg-muted" : "bg-brand-100 dark:bg-brand-50/10",
                  )}>
                    <Shield className={cn("w-4.5 h-4.5", gp.is_used ? "text-muted-foreground" : "text-brand-700 dark:text-brand-400")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground tracking-wider">{gp.verification_code}</span>
                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full",
                        gp.is_used ? "bg-muted text-muted-foreground" : "bg-success-muted text-success")}>
                        {gp.is_used ? "Used" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {gp.customer_name ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Car className="w-3 h-3" /> {gp.vehicle_plate ?? "—"} · {gp.vehicle_brand} {gp.vehicle_model}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{gp.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(gp.created_at, "relative")}</p>
                    </div>
                    <a
                      href={`${API_BASE_URL}/pdf/gate-pass/${gp.id}`}
                      target="_blank" rel="noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}