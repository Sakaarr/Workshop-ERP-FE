"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Car, Search, Fuel, Gauge,
  Pencil, Trash2, ChevronRight, User, Square, CheckSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { VehicleDrawer } from "@/components/vehicles/vehicle-drawer";
import { vehiclesApi, type Vehicle } from "@/lib/api/vehicles";
import { formatDate, cn } from "@/lib/utils";

const FUEL_COLORS: Record<string, string> = {
  petrol:   "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  diesel:   "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  electric: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  hybrid:   "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  cng:      "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  other:    "bg-muted text-muted-foreground",
};

export default function VehiclesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._vSearch);
    (window as any)._vSearch = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", page, debouncedSearch],
    queryFn: () => vehiclesApi.list({ page, page_size: 24, search: debouncedSearch || undefined }),
  });

  const items = data?.items ?? [];
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && items.every(vehicle => selectedIds.includes(vehicle.id));

  const deleteMutation = useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => { toast.success("Vehicle removed"); qc.invalidateQueries({ queryKey: ["vehicles"] }); setSelectedIds([]); },
    onError: () => toast.error("Failed to delete vehicle"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: vehiclesApi.bulkDelete,
    onSuccess: () => {
      toast.success("Vehicles removed");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      setSelectedIds([]);
    },
    onError: () => toast.error("Failed to delete vehicles"),
  });

  const toggleSelected = (id: string) => {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Vehicles" />
      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Vehicles</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} registered vehicles</p>
          </div>
          {selectedCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteTarget(items.find(item => item.id === selectedIds[0]) ?? null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/15 transition-colors"
            >
              Delete Selected ({selectedCount})
            </motion.button>
          )}
        </div>

        {/* Search + fuel filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search plate, brand, VIN..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Vehicle cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-xl" />
              ))
                : data?.items.map((vehicle, i) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-4 group hover:shadow-card-hover transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                >
                  {/* Brand + plate */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{vehicle.brand} {vehicle.model}</p>
                        {vehicle.year && <p className="text-xs text-muted-foreground">{vehicle.year}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelected(vehicle.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {selectedIds.includes(vehicle.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { setEditVehicle(vehicle); setDrawerOpen(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(vehicle)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Plate number — prominent */}
                  <div className="bg-muted/40 rounded-lg px-3 py-2 text-center">
                    <p className="font-mono font-bold text-foreground text-lg tracking-widest">{vehicle.plate_number}</p>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded capitalize", FUEL_COLORS[vehicle.fuel_type])}>
                        {vehicle.fuel_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{vehicle.last_odometer.toLocaleString()} km</span>
                    </div>
                    {vehicle.color && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <div className="w-3 h-3 rounded-full border border-border shrink-0" style={{ background: vehicle.color.toLowerCase() === "white" ? "#f5f5f5" : vehicle.color.toLowerCase() }} />
                        <span className="text-xs text-muted-foreground capitalize">{vehicle.color}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    {vehicle.customer_name ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[120px]">{vehicle.customer_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">No owner linked</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
        </div>

        {!isLoading && data?.items.length === 0 && (
          <EmptyState
            icon={Car}
            title="No vehicles registered"
            description="Register customer vehicles to start tracking service history"
          />
        )}

        {data && data.total > 0 && (
          <Pagination page={page} pages={data.pages} total={data.total} pageSize={data.page_size} onPageChange={setPage} />
        )}
      </div>

      <VehicleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} vehicle={editVehicle} />
      <ConfirmDialog
        open={!!deleteTarget}
        title={selectedCount > 1 ? `Delete ${selectedCount} vehicles?` : `Delete ${deleteTarget?.plate_number ?? "vehicle"}?`}
        description={selectedCount > 1
          ? "This will permanently remove the selected vehicles from the list."
          : "This will permanently remove the vehicle from the list."}
        confirmLabel="Delete"
        loading={deleteMutation.isPending || bulkDeleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (selectedCount > 1) {
            bulkDeleteMutation.mutate(selectedIds);
          } else if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
