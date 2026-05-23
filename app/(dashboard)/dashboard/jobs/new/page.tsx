"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Car, User, Loader2, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { customersApi } from "@/lib/api/customers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { jobCardsApi } from "@/lib/api/job-cards";
import { cn } from "@/lib/utils";

const schema = z.object({
  customer_id: z.string().min(1, "Select a customer"),
  vehicle_id: z.string().min(1, "Select a vehicle"),
  complaint: z.string().min(5, "Describe the complaint"),
  odometer_in: z.string().min(1, "Enter odometer reading"),
  estimated_cost: z.string().optional(),
  internal_notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewJobCardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedCustomerId = watch("customer_id");

  const { data: customers } = useQuery({
    queryKey: ["customers-search", customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch || undefined, page_size: 8 }),
    enabled: showCustomerDropdown,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "by-customer", watchedCustomerId],
    queryFn: () => vehiclesApi.byCustomer(watchedCustomerId),
    enabled: !!watchedCustomerId,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => jobCardsApi.create({
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      complaint: data.complaint,
      odometer_in: parseInt(data.odometer_in),
      estimated_cost: data.estimated_cost || "0",
      internal_notes: data.internal_notes || undefined,
    }),
    onSuccess: (job) => {
      toast.success(`Job card ${job.job_number} created`);
      qc.invalidateQueries({ queryKey: ["job-cards"] });
      router.push(`/dashboard/jobs/${job.id}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to create job card"),
  });

  const inputCls = (err: boolean) => cn(
    "w-full h-10 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors",
    err ? "border-destructive" : "border-border",
  );

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="flex-1 p-6 max-w-[720px] w-full mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-brand-700 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">New Job Card</h1>
              <p className="text-sm text-muted-foreground">Create a new workshop job</p>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(d => mutation.mutate(d))}
          className="space-y-6"
        >
          {/* Customer selection */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Customer
            </h2>
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-muted-foreground">Search customer <span className="text-destructive">*</span></label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Type name or phone..."
                  className={cn(inputCls(!!errors.customer_id), "pl-9")}
                />
              </div>
              {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}

              {/* Dropdown */}
              {showCustomerDropdown && customers && customers.items.length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-elevated overflow-hidden">
                  {customers.items.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setValue("customer_id", c.id);
                        setValue("vehicle_id", "");
                        setSelectedCustomerId(c.id);
                        setCustomerSearch(c.name);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone_primary}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle selection */}
          {watchedCustomerId && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" /> Vehicle
              </h2>
              {vehicles && vehicles.length > 0 ? (
                <div className="space-y-2">
                  {vehicles.map(v => (
                    <label
                      key={v.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        watch("vehicle_id") === v.id
                          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-50/5"
                          : "border-border hover:border-border/60 hover:bg-muted/30",
                      )}
                    >
                      <input
                        {...register("vehicle_id")}
                        type="radio"
                        value={v.id}
                        className="accent-brand-500"
                      />
                      <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.plate_number}</p>
                        <p className="text-xs text-muted-foreground">{v.brand} {v.model} · {v.fuel_type} · {v.last_odometer.toLocaleString()} km</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicles registered for this customer</p>
              )}
              {errors.vehicle_id && <p className="text-xs text-destructive">{errors.vehicle_id.message}</p>}
            </motion.div>
          )}

          {/* Job details */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-foreground">Job Details</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Customer Complaint <span className="text-destructive">*</span></label>
              <textarea
                {...register("complaint")}
                rows={3}
                placeholder="Describe what the customer reported..."
                className={cn(inputCls(!!errors.complaint), "h-auto resize-none py-2.5")}
              />
              {errors.complaint && <p className="text-xs text-destructive">{errors.complaint.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Odometer In (km) <span className="text-destructive">*</span></label>
                <input {...register("odometer_in")} type="number" placeholder="e.g. 45000" className={inputCls(!!errors.odometer_in)} />
                {errors.odometer_in && <p className="text-xs text-destructive">{errors.odometer_in.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Estimated Cost (NPR)</label>
                <input {...register("estimated_cost")} type="number" placeholder="0.00" className={inputCls(false)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Internal Notes</label>
              <textarea
                {...register("internal_notes")}
                rows={2}
                placeholder="Notes for mechanics (not shown to customer)..."
                className={cn(inputCls(false), "h-auto resize-none py-2.5")}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">
              Cancel
            </button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={mutation.isPending}
              className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Job Card
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}