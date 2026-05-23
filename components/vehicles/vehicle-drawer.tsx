"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Car } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { vehiclesApi, type Vehicle } from "@/lib/api/vehicles";
import { customersApi } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

const schema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  plate_number: z.string().min(1, "Plate number is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  fuel_type: z.enum(["petrol", "diesel", "electric", "hybrid", "cng", "other"]),
  year: z.string().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  engine_number: z.string().optional(),
  last_odometer: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  defaultCustomerId?: string;
}

export function VehicleDrawer({ open, onClose, vehicle, defaultCustomerId }: Props) {
  const qc = useQueryClient();
  const isEdit = !!vehicle;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(vehicle ? {
        customer_id: vehicle.customer_id,
        plate_number: vehicle.plate_number,
        brand: vehicle.brand,
        model: vehicle.model,
        fuel_type: vehicle.fuel_type,
        year: vehicle.year?.toString() ?? "",
        color: vehicle.color ?? "",
        vin: vehicle.vin ?? "",
        engine_number: vehicle.engine_number ?? "",
        last_odometer: vehicle.last_odometer?.toString() ?? "0",
      } : {
        customer_id: defaultCustomerId ?? "",
        plate_number: "", brand: "", model: "", fuel_type: "petrol",
        year: "", color: "", vin: "", engine_number: "", last_odometer: "0",
      });
    }
  }, [open, vehicle, defaultCustomerId, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        year: data.year ? parseInt(data.year) : undefined,
        last_odometer: data.last_odometer ? parseInt(data.last_odometer) : 0,
        vin: data.vin || undefined,
        engine_number: data.engine_number || undefined,
        color: data.color || undefined,
      };
      return isEdit ? vehiclesApi.update(vehicle!.id, payload) : vehiclesApi.create(payload as any);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Vehicle updated" : "Vehicle added");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Something went wrong"),
  });

  const inputCls = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors",
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-card border-l border-border shadow-dialog flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">{isEdit ? "Edit Vehicle" : "Add Vehicle"}</h2>
                  <p className="text-xs text-muted-foreground">{isEdit ? vehicle.plate_number : "Register a new vehicle"}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Plate Number <span className="text-destructive">*</span></label>
                <input {...register("plate_number")} placeholder="BA 1 CHA 1234" className={inputCls(!!errors.plate_number)} />
                {errors.plate_number && <p className="text-xs text-destructive">{errors.plate_number.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Brand <span className="text-destructive">*</span></label>
                  <input {...register("brand")} placeholder="Toyota" className={inputCls(!!errors.brand)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Model <span className="text-destructive">*</span></label>
                  <input {...register("model")} placeholder="Hilux" className={inputCls(!!errors.model)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Year</label>
                  <input {...register("year")} type="number" placeholder="2020" className={inputCls(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Color</label>
                  <input {...register("color")} placeholder="White" className={inputCls(false)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Fuel Type <span className="text-destructive">*</span></label>
                <select {...register("fuel_type")} className={inputCls(false)}>
                  {["petrol", "diesel", "electric", "hybrid", "cng", "other"].map(f => (
                    <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">VIN / Chassis</label>
                  <input {...register("vin")} placeholder="VIN number" className={inputCls(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Engine Number</label>
                  <input {...register("engine_number")} placeholder="Engine no." className={inputCls(false)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current Odometer (km)</label>
                <input {...register("last_odometer")} type="number" placeholder="0" className={inputCls(false)} />
              </div>
            </form>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">Cancel</button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit(d => mutation.mutate(d))}
                disabled={mutation.isPending}
                className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Add Vehicle"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}