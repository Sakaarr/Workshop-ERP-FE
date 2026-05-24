"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Plus, Search, Phone, Mail, MapPin, Pencil, Trash2, X, Loader2, Building } from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { suppliersApi, type Supplier } from "@/lib/api/suppliers";
import { formatDate, cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  pan_vat: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._supSearch);
    (window as any)._supSearch = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, debouncedSearch],
    queryFn: () => suppliersApi.list({ page, page_size: 20, search: debouncedSearch || undefined }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => { setEditSupplier(null); setDrawerOpen(true); reset({}); };
  const openEdit = (s: Supplier) => {
    setEditSupplier(s);
    setDrawerOpen(true);
    reset({
      name: s.name, contact_name: s.contact_name ?? "", phone: s.phone ?? "",
      email: s.email ?? "", address: s.address ?? "", pan_vat: s.pan_vat ?? "", notes: s.notes ?? "",
    });
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, email: data.email || undefined };
      return editSupplier
        ? suppliersApi.update(editSupplier.id, payload)
        : suppliersApi.create(payload as any);
    },
    onSuccess: () => {
      toast.success(editSupplier ? "Supplier updated" : "Supplier added");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDrawerOpen(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to save supplier"),
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => { toast.success("Supplier deleted"); qc.invalidateQueries({ queryKey: ["suppliers"] }); },
  });

  const ic = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Suppliers" />
      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} suppliers</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </motion.button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Supplier cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-xl" />)
            : data?.items.map((supplier, i) => (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-3 group hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{supplier.name}</h3>
                        {supplier.contact_name && (
                          <p className="text-xs text-muted-foreground">{supplier.contact_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(supplier)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${supplier.name}?`)) deleteMutation.mutate(supplier.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {supplier.pan_vat && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">PAN/VAT: </span>
                      <span className="text-[11px] font-medium text-foreground font-mono">{supplier.pan_vat}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">Added {formatDate(supplier.created_at)}</p>
                </motion.div>
              ))}
        </div>

        {!isLoading && data?.items.length === 0 && (
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add your parts suppliers to track inventory sources"
            action={{ label: "Add Supplier", onClick: openCreate }}
          />
        )}

        {data && data.total > 20 && (
          <Pagination page={page} pages={data.pages} total={data.total} pageSize={data.page_size} onPageChange={setPage} />
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[460px] bg-card border-l border-border shadow-dialog flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                  </div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {editSupplier ? "Edit Supplier" : "Add Supplier"}
                  </h2>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Supplier / Company Name *</label>
                  <input {...register("name")} placeholder="e.g. Nepal Auto Parts Pvt. Ltd." className={ic(!!errors.name)} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Contact Person</label>
                  <input {...register("contact_name")} placeholder="Primary contact name" className={ic(false)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <input {...register("phone")} placeholder="98XXXXXXXX" className={ic(false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">PAN / VAT</label>
                    <input {...register("pan_vat")} placeholder="PAN number" className={ic(false)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input {...register("email")} type="email" placeholder="supplier@example.com" className={ic(!!errors.email)} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Address</label>
                  <textarea {...register("address")} rows={2} placeholder="Full address..." className={cn(ic(false), "h-auto resize-none py-2")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <textarea {...register("notes")} rows={2} placeholder="Payment terms, lead time, etc." className={cn(ic(false), "h-auto resize-none py-2")} />
                </div>
              </form>

              <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
                <button onClick={() => setDrawerOpen(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit(d => mutation.mutate(d))}
                  disabled={mutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editSupplier ? "Save Changes" : "Add Supplier"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}