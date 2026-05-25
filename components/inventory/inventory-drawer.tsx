"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Package } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { inventoryApi, type InventoryItem } from "@/lib/api/inventory";
import { suppliersApi } from "@/lib/api/suppliers";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  part_number: z.string().optional(),
  category: z.string().min(1, "Category required"),
  unit: z.string().default("piece"),
  quantity: z.string().default("0"),
  low_stock_threshold: z.string().default("5"),
  cost_price: z.string().min(1, "Cost price required"),
  selling_price: z.string().min(1, "Selling price required"),
  supplier_id: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PRESET_CATEGORIES = [
  "Engine Parts", "Brakes", "Suspension", "Electrical", "Body Parts",
  "Filters", "Fluids & Oils", "Tyres & Wheels", "Transmission", "Exhaust", "Cooling System", "Other",
];

interface Props {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

export function InventoryDrawer({ open, onClose, item }: Props) {
  const qc = useQueryClient();
  const isEdit = !!item;

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", 1, ""],
    queryFn: () => suppliersApi.list({ page: 1, page_size: 100 }),
    enabled: open,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(item ? {
        name: item.name,
        part_number: item.part_number ?? "",
        category: item.category,
        unit: item.unit,
        quantity: String(item.quantity),
        low_stock_threshold: String(item.low_stock_threshold),
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        supplier_id: item.supplier_id ?? "",
        barcode: item.barcode ?? "",
        location: item.location ?? "",
        description: item.description ?? "",
      } : {
        name: "", part_number: "", category: "", unit: "piece",
        quantity: "0", low_stock_threshold: "5", cost_price: "",
        selling_price: "", supplier_id: "", barcode: "", location: "", description: "",
      });
    }
  }, [open, item, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        quantity: parseInt(data.quantity) || 0,
        low_stock_threshold: parseInt(data.low_stock_threshold) || 5,
        part_number: data.part_number || undefined,
        barcode: data.barcode || undefined,
        location: data.location || undefined,
        description: data.description || undefined,
        supplier_id: data.supplier_id || undefined,
      };
      return isEdit ? inventoryApi.update(item!.id, payload) : inventoryApi.create(payload as any);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Item updated" : "Item added");
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-categories"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to save item"),
  });

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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[500px] bg-card border-l border-border shadow-dialog flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">{isEdit ? "Edit Part" : "Add Part"}</h2>
                  <p className="text-xs text-muted-foreground">{isEdit ? item.name : "Register a new inventory item"}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Part Name <span className="text-destructive">*</span></label>
                <input {...register("name")} placeholder="e.g. Brake Pad Set — Toyota Hilux" className={ic(!!errors.name)} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              {/* Part no + barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Part Number</label>
                  <input {...register("part_number")} placeholder="e.g. BP-1234" className={ic(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Barcode</label>
                  <input {...register("barcode")} placeholder="Scan or type..." className={ic(false)} />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category <span className="text-destructive">*</span></label>
                <select {...register("category")} className={ic(!!errors.category)}>
                  <option value="">Select category...</option>
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              {/* Supplier — THE KEY NEW FIELD */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Supplier
                  <span className="ml-1.5 text-[10px] text-muted-foreground/60 font-normal">(optional)</span>
                </label>
                <select {...register("supplier_id")} className={ic(false)}>
                  <option value="">No supplier linked</option>
                  {suppliersData?.items.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.phone ? ` — ${s.phone}` : ""}</option>
                  ))}
                </select>
                {(!suppliersData?.items.length) && (
                  <p className="text-[11px] text-muted-foreground">
                    No suppliers yet.{" "}
                    <a href="/dashboard/suppliers" className="text-brand-600 hover:underline">Add a supplier first</a>
                  </p>
                )}
              </div>

              {/* Unit + Qty + Threshold */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Unit</label>
                  <select {...register("unit")} className={ic(false)}>
                    {["piece", "set", "litre", "kg", "metre", "box", "pair"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Qty</label>
                  <input {...register("quantity")} type="number" placeholder="0" className={ic(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Alert At</label>
                  <input {...register("low_stock_threshold")} type="number" placeholder="5" className={ic(false)} />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cost Price (NPR) <span className="text-destructive">*</span></label>
                  <input {...register("cost_price")} type="number" step="0.01" placeholder="0.00" className={ic(!!errors.cost_price)} />
                  {errors.cost_price && <p className="text-xs text-destructive">{errors.cost_price.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Selling Price (NPR) <span className="text-destructive">*</span></label>
                  <input {...register("selling_price")} type="number" step="0.01" placeholder="0.00" className={ic(!!errors.selling_price)} />
                  {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price.message}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Storage Location</label>
                <input {...register("location")} placeholder="e.g. Shelf A-3, Rack B" className={ic(false)} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea {...register("description")} rows={2} placeholder="Optional notes about this part..." className={cn(ic(false), "h-auto resize-none py-2")} />
              </div>
            </form>

            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit(d => mutation.mutate(d))}
                disabled={mutation.isPending}
                className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Add Part"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}