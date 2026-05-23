"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Car, ClipboardList, Pencil, Plus } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { customersApi } from "@/lib/api/customers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { jobCardsApi } from "@/lib/api/job-cards";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useState } from "react";
import { CustomerDrawer } from "@/components/customers/customer-drawer";
import { VehicleDrawer } from "@/components/vehicles/vehicle-drawer";

const STATUS_STYLE: Record<string, string> = {
  waiting: "badge-waiting", diagnosing: "badge-diagnosing", repairing: "badge-repairing",
  waiting_parts: "badge-waiting", ready: "badge-ready", delivered: "badge-delivered", cancelled: "badge-cancelled",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.get(id),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "by-customer", id],
    queryFn: () => vehiclesApi.byCustomer(id),
    enabled: !!id,
  });

  const { data: jobsData } = useQuery({
    queryKey: ["job-cards", { customer_id: id }],
    queryFn: () => jobCardsApi.list({ page: 1, page_size: 10 }),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    </div>
  );

  if (!customer) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-6">

        {/* Back + Header */}
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 dark:text-brand-400 text-xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Customer since {formatDate(customer.created_at, "long")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/60 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — details */}
          <div className="space-y-4">
            {/* Contact card */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Contact</h3>
              <InfoRow icon={Phone} label={customer.phone_primary} />
              {customer.phone_secondary && <InfoRow icon={Phone} label={customer.phone_secondary} />}
              {customer.email && <InfoRow icon={Mail} label={customer.email} />}
              {customer.address && <InfoRow icon={MapPin} label={customer.address} />}
            </motion.div>

            {/* Balance card */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Balance</h3>
              <p className={cn("text-2xl font-bold", parseFloat(customer.outstanding_balance) > 0 ? "text-destructive" : "text-success")}>
                {formatCurrency(customer.outstanding_balance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Outstanding amount</p>
            </motion.div>

            {/* Meta */}
            {(customer.pan_vat || customer.city) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Details</h3>
                {customer.city && <InfoRow icon={MapPin} label={customer.city} sublabel="City" />}
                {customer.pan_vat && <InfoRow icon={FileText} label={customer.pan_vat} sublabel="PAN/VAT" />}
              </motion.div>
            )}
          </div>

          {/* Right — vehicles + jobs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Vehicles */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-semibold text-foreground">Vehicles</h3>
                  <span className="text-xs text-muted-foreground">({vehicles?.length ?? 0})</span>
                </div>
                <button onClick={() => setVehicleOpen(true)} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Vehicle
                </button>
              </div>
              {vehicles && vehicles.length > 0 ? (
                <div className="divide-y divide-border">
                  {vehicles.map(v => (
                    <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => router.push(`/dashboard/vehicles/${v.id}`)}>
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{v.plate_number}</p>
                        <p className="text-xs text-muted-foreground">{v.brand} {v.model} {v.year ? `(${v.year})` : ""} · <span className="capitalize">{v.fuel_type}</span></p>
                      </div>
                      <span className="text-xs text-muted-foreground">{v.last_odometer.toLocaleString()} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No vehicles registered</div>
              )}
            </motion.div>

            {/* Recent jobs */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-semibold text-foreground">Recent Job Cards</h3>
                </div>
                <button onClick={() => router.push("/dashboard/jobs/new")} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Job
                </button>
              </div>
              {jobsData && jobsData.items.filter(j => j.customer_id === id).length > 0 ? (
                <div className="divide-y divide-border">
                  {jobsData.items.filter(j => j.customer_id === id).slice(0, 5).map(j => (
                    <div key={j.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/jobs/${j.id}`)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{j.job_number}</span>
                          <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium", STATUS_STYLE[j.status])}>
                            {j.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5 truncate">{j.complaint}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(j.created_at, "relative")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No job cards yet</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <CustomerDrawer open={editOpen} onClose={() => setEditOpen(false)} customer={customer} />
      <VehicleDrawer open={vehicleOpen} onClose={() => setVehicleOpen(false)} defaultCustomerId={id} />
    </div>
  );
}

function InfoRow({ icon: Icon, label, sublabel }: { icon: React.ElementType; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}