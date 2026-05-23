"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Phone, MapPin, Car, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomerDrawer } from "@/components/customers/customer-drawer";
import { customersApi, type CustomerListItem } from "@/lib/api/customers";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function CustomersPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerListItem | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // debounce search
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, debouncedSearch],
    queryFn: () => customersApi.list({ page, page_size: 20, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const openCreate = () => { setEditingCustomer(null); setDrawerOpen(true); };
  const openEdit = (c: CustomerListItem) => { setEditingCustomer(c as any); setDrawerOpen(true); setMenuOpen(null); };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Customers" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} total customers
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, phone, PAN..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Customer", "Phone", "City", "Vehicles", "Balance", "Since", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.items.map((customer, i) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 dark:text-brand-400 text-xs font-bold shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <button
                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                            className="font-medium text-foreground hover:text-brand-600 transition-colors text-left"
                          >
                            {customer.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {customer.phone_primary}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.city ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {customer.city}
                          </div>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Car className="w-3.5 h-3.5" />
                          <span>{customer.vehicle_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {parseFloat(customer.outstanding_balance) > 0 ? (
                          <span className="text-destructive font-medium">
                            {formatCurrency(customer.outstanding_balance)}
                          </span>
                        ) : (
                          <span className="text-success text-xs font-medium">Cleared</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(customer)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${customer.name}?`)) deleteMutation.mutate(customer.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && data?.items.length === 0 && (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to get started"
              action={{ label: "Add Customer", onClick: openCreate }}
            />
          )}

          {data && data.total > 0 && (
            <Pagination
              page={page} pages={data.pages} total={data.total}
              pageSize={data.page_size} onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <CustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={editingCustomer as any}
      />
    </div>
  );
}