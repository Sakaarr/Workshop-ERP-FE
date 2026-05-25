"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Car, User, Fuel, Gauge, Hash,
  Wrench, ClipboardList, Plus, Pencil, Calendar,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { VehicleDrawer } from "@/components/vehicles/vehicle-drawer";
import { vehiclesApi } from "@/lib/api/vehicles";
import { jobCardsApi } from "@/lib/api/job-cards";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const FUEL_COLORS: Record<string, string> = {
  petrol:   "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  diesel:   "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  electric: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  hybrid:   "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  cng:      "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  other:    "bg-muted text-muted-foreground",
};

const STATUS_BADGE: Record<string, string> = {
  waiting: "badge-waiting", diagnosing: "badge-diagnosing", repairing: "badge-repairing",
  waiting_parts: "badge-waiting", ready: "badge-ready", delivered: "badge-delivered",
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesApi.get(id),
  });

  const { data: jobsData } = useQuery({
    queryKey: ["job-cards", "all"],
    queryFn: () => jobCardsApi.list({ page: 1, page_size: 100 }),
    enabled: !!id,
  });

  const vehicleJobs = jobsData?.items.filter(j => j.vehicle_id === id) ?? [];

  if (isLoading) return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );

  if (!vehicle) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="flex-1 p-6 max-w-[1100px] w-full mx-auto space-y-5">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </button>

        {/* Hero */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground font-mono tracking-widest">{vehicle.plate_number}</h1>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", FUEL_COLORS[vehicle.fuel_type])}>
                  {vehicle.fuel_type}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}</p>
              {vehicle.color && <p className="text-sm text-muted-foreground capitalize">{vehicle.color}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/60 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — specs */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Specifications</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Car,     label: "Brand / Model", value: `${vehicle.brand} ${vehicle.model}` },
                  { icon: Calendar, label: "Year",         value: vehicle.year ? String(vehicle.year) : "—" },
                  { icon: Fuel,    label: "Fuel Type",     value: vehicle.fuel_type },
                  { icon: Gauge,   label: "Last Odometer", value: `${vehicle.last_odometer.toLocaleString()} km` },
                ].map(row => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span className="text-xs font-medium text-foreground capitalize">{row.value}</span>
                      </div>
                    </div>
                  );
                })}
                {vehicle.vin && (
                  <div className="flex items-start gap-2.5 pt-2 border-t border-border">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">VIN / Chassis</p>
                      <p className="text-xs font-mono font-medium text-foreground mt-0.5">{vehicle.vin}</p>
                    </div>
                  </div>
                )}
                {vehicle.engine_number && (
                  <div className="flex items-start gap-2.5">
                    <Wrench className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Engine Number</p>
                      <p className="text-xs font-mono font-medium text-foreground mt-0.5">{vehicle.engine_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Owner */}
            {vehicle.customer_name && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Owner</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                    {vehicle.customer_name.charAt(0)}
                  </div>
                  <div>
                    <button
                      onClick={() => router.push(`/dashboard/customers/${vehicle.customer_id}`)}
                      className="text-sm font-medium text-foreground hover:text-brand-600 transition-colors"
                    >
                      {vehicle.customer_name}
                    </button>
                    {vehicle.customer_phone && (
                      <p className="text-xs text-muted-foreground">{vehicle.customer_phone}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — service history */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-semibold text-foreground">Service History</h3>
                  <span className="text-xs text-muted-foreground">({vehicleJobs.length})</span>
                </div>
                <button
                  onClick={() => router.push("/dashboard/jobs/new")}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> New Job
                </button>
              </div>

              {vehicleJobs.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <Wrench className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No service history yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {vehicleJobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{job.job_number}</span>
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize", STATUS_BADGE[job.status])}>
                            {job.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">{job.complaint}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(job.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(job.estimated_cost)}</p>
                        <p className="text-xs text-muted-foreground">estimated</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <VehicleDrawer open={editOpen} onClose={() => setEditOpen(false)} vehicle={vehicle} />
    </div>
  );
}