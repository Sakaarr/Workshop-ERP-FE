"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, AlertTriangle, Pencil,
  Trash2, ArrowUp, ArrowDown, Tag, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { InventoryDrawer } from "@/components/inventory/inventory-drawer";
import { StockAdjustDrawer } from "@/components/inventory/stock-adjust-drawer";
import { inventoryApi, type InventoryItem } from "@/lib/api/inventory";
import { formatCurrency, cn } from "@/lib/utils";

export default function InventoryPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._invSearch);
    (window as any)._invSearch = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, debouncedSearch, category, lowStockOnly],
    queryFn: () => inventoryApi.list({
      page, page_size: 25,
      search: debouncedSearch || undefined,
      category: category || undefined,
      low_stock: lowStockOnly || undefined,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: inventoryApi.categories,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: inventoryApi.lowStock,
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => { toast.success("Item deleted"); qc.invalidateQueries({ queryKey: ["inventory"] }); },
    onError: () => toast.error("Failed to delete item"),
  });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Inventory" />

      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Parts & Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} items
              {(lowStockItems?.length ?? 0) > 0 && (
                <span className="ml-2 text-warning font-medium">
                  · {lowStockItems?.length} low stock
                </span>
              )}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Part
          </motion.button>
        </div>

        {/* Low stock alert */}
        {(lowStockItems?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-warning-muted border border-warning/20 rounded-xl"
          >
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span className="text-sm text-warning-foreground">
              <span className="font-semibold">{lowStockItems?.length} items</span> are running low on stock
            </span>
            <button
              onClick={() => setLowStockOnly(v => !v)}
              className={cn("ml-auto text-xs font-medium px-2.5 py-1 rounded-lg transition-colors",
                lowStockOnly ? "bg-warning text-warning-foreground" : "text-warning hover:bg-warning/10")}
            >
              {lowStockOnly ? "Show All" : "View Low Stock"}
            </button>
          </motion.div>
        )}

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search parts, part no, barcode..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => { setCategory(null); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                !category ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:bg-muted/60")}
            >
              All
            </button>
            {categories?.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                  category === cat ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:bg-muted/60")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Part Name", "Part No.", "Category", "Stock", "Cost", "Selling Price", "Supplier", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" style={{ width: `${35 + Math.random() * 45}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", item.is_low_stock ? "bg-warning" : "bg-success")} />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {item.part_number ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                          <Tag className="w-2.5 h-2.5" />
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-semibold text-sm tabular-nums",
                            item.is_low_stock ? "text-warning" : "text-foreground")}>
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground text-xs">{item.unit}</span>
                          {item.is_low_stock && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCurrency(item.cost_price)}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.selling_price)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{item.supplier_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setAdjustItem(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-brand-50 dark:hover:bg-brand-50/10 text-muted-foreground hover:text-brand-600 transition-colors"
                            title="Adjust stock"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setEditItem(item); setDrawerOpen(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(item.id); }}
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
              icon={Package}
              title="No parts found"
              description="Add your first inventory item to get started"
              action={{ label: "Add Part", onClick: () => setDrawerOpen(true) }}
            />
          )}

          {data && data.total > 0 && (
            <Pagination page={page} pages={data.pages} total={data.total} pageSize={data.page_size} onPageChange={setPage} />
          )}
        </div>
      </div>

      <InventoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} item={editItem} />
      <StockAdjustDrawer open={!!adjustItem} onClose={() => setAdjustItem(null)} item={adjustItem} />
    </div>
  );
}