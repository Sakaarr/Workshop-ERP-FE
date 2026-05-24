"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, Car, ClipboardList, Package, Receipt,
  BookOpen, BarChart3, Settings, Truck, Shield, UserCog,
  LayoutDashboard, ArrowRight, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks/use-permissions";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
  keywords?: string[];
}

const ALL_COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", permission: "dashboard.view", keywords: ["home", "overview"] },
  { id: "customers", label: "Customers", description: "View all customers", icon: Users, href: "/dashboard/customers", permission: "customers.view" },
  { id: "new-customer", label: "New Customer", description: "Add a customer", icon: Users, href: "/dashboard/customers", permission: "customers.create", keywords: ["add customer", "create customer"] },
  { id: "vehicles", label: "Vehicles", icon: Car, href: "/dashboard/vehicles", permission: "vehicles.view" },
  { id: "jobs", label: "Job Cards", icon: ClipboardList, href: "/dashboard/jobs", permission: "jobs.view" },
  { id: "new-job", label: "New Job Card", description: "Create a job card", icon: ClipboardList, href: "/dashboard/jobs/new", permission: "jobs.create", keywords: ["add job", "create job"] },
  { id: "billing", label: "Billing & Invoices", icon: Receipt, href: "/dashboard/billing", permission: "billing.view" },
  { id: "inventory", label: "Inventory / Parts", icon: Package, href: "/dashboard/inventory", permission: "inventory.view" },
  { id: "suppliers", label: "Suppliers", icon: Truck, href: "/dashboard/suppliers", permission: "suppliers.view" },
  { id: "daybook", label: "Day Book", icon: BookOpen, href: "/dashboard/daybook", permission: "daybook.view" },
  { id: "gate-pass", label: "Gate Pass", icon: Shield, href: "/dashboard/gate-pass", permission: "gate_pass.view" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/dashboard/reports", permission: "reports.view" },
  { id: "staff", label: "Staff Management", icon: UserCog, href: "/dashboard/staff", permission: "staff.view" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings", permission: "settings.view" },
];

export function CommandPalette() {
  const router = useRouter();
  const { can } = usePermissions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const toggle = useCallback(() => {
    setOpen(v => !v);
    setQuery("");
    setSelected(0);
  }, []);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggle]);

  const filtered = ALL_COMMANDS.filter(cmd => {
    if (cmd.permission && !can(cmd.permission)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      (cmd.description ?? "").toLowerCase().includes(q) ||
      (cmd.keywords ?? []).some(k => k.toLowerCase().includes(q))
    );
  });

  const navigate = (item: CommandItem) => {
    router.push(item.href);
    setOpen(false);
    setQuery("");
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) navigate(filtered[selected]);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filtered, selected]);

  useEffect(() => setSelected(0), [query]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[560px] bg-card border border-border rounded-2xl shadow-dialog overflow-hidden pointer-events-auto"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search pages, actions..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <kbd className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-[380px] overflow-y-auto py-2">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No results for "{query}"
                    </div>
                  ) : (
                    <>
                      {!query && (
                        <p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                          Navigation
                        </p>
                      )}
                      {filtered.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigate(item)}
                            onMouseEnter={() => setSelected(i)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              selected === i ? "bg-muted/60" : "hover:bg-muted/40",
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              selected === i ? "bg-brand-100 dark:bg-brand-50/10" : "bg-muted/60",
                            )}>
                              <Icon className={cn("w-4 h-4", selected === i ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            {selected === i && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Footer hint */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/20">
                  {[
                    { keys: ["↑", "↓"], label: "navigate" },
                    { keys: ["↵"], label: "select" },
                    { keys: ["esc"], label: "close" },
                  ].map(hint => (
                    <div key={hint.label} className="flex items-center gap-1.5">
                      {hint.keys.map(k => (
                        <kbd key={k} className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">{k}</kbd>
                      ))}
                      <span className="text-[11px] text-muted-foreground">{hint.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}