"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowUp, ArrowDown, Package } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { inventoryApi, type InventoryItem } from "@/lib/api/inventory";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function StockAdjustDrawer({ open, onClose, item }: Props) {
  const qc = useQueryClient();
  const [type, setType] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const delta = type === "add" ? parseInt(amount) : -parseInt(amount);
      return inventoryApi.adjustStock(item!.id, delta, reason);
    },
    onSuccess: (updated) => {
      toast.success(`Stock updated → ${updated.quantity} ${updated.unit}`);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      setAmount(""); setReason("");
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Stock adjustment failed"),
  });

  const ic = cn("w-full h-9 px-3 rounded-lg border border-border text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-colors");

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] bg-card border-l border-border shadow-dialog flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">Adjust Stock</h2>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Current stock */}
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                  <p className={cn("text-2xl font-bold", item.is_low_stock ? "text-warning" : "text-foreground")}>
                    {item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                  </p>
                </div>
                {item.is_low_stock && (
                  <span className="text-xs font-medium text-warning bg-warning-muted px-2 py-1 rounded-lg">Low Stock</span>
                )}
              </div>

              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setType("add")}
                  className={cn("flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all",
                    type === "add" ? "bg-success-muted text-success border-success/30" : "border-border text-muted-foreground hover:bg-muted/60")}
                >
                  <ArrowUp className="w-4 h-4" /> Add Stock
                </button>
                <button
                  onClick={() => setType("remove")}
                  className={cn("flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all",
                    type === "remove" ? "bg-destructive/10 text-destructive border-destructive/30" : "border-border text-muted-foreground hover:bg-muted/60")}
                >
                  <ArrowDown className="w-4 h-4" /> Remove
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Quantity <span className="text-destructive">*</span></label>
                <input
                  type="number" min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 10"
                  className={ic}
                />
                {amount && (
                  <p className="text-xs text-muted-foreground">
                    New stock will be: <span className="font-semibold text-foreground">
                      {type === "add" ? item.quantity + parseInt(amount || "0") : item.quantity - parseInt(amount || "0")} {item.unit}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Reason <span className="text-destructive">*</span></label>
                <input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Purchase received, Used in job JC-2411-001"
                  className={ic}
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">Cancel</button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !amount || !reason}
                className={cn(
                  "flex-1 h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
                  type === "add" ? "bg-success text-success-foreground hover:opacity-90" : "bg-destructive text-destructive-foreground hover:opacity-90"
                )}
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {type === "add" ? "Add Stock" : "Remove Stock"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}