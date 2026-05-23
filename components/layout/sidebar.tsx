"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Package,
  Receipt,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Wrench,
  ChevronLeft,
  Bell,
  Shield,
  Truck,
  UserCog,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/vehicles", label: "Vehicles", icon: Car },
      { href: "/dashboard/jobs", label: "Job Cards", icon: ClipboardList },
      { href: "/dashboard/billing", label: "Billing", icon: Receipt },
      { href: "/dashboard/gate-pass", label: "Gate Pass", icon: Shield },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/daybook", label: "Day Book", icon: BookOpen },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/dashboard/inventory", label: "Parts & Stock", icon: Package },
      { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/staff", label: "Staff", icon: UserCog, roles: ["super_admin", "admin"] },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex flex-col h-full bg-card border-r border-border overflow-hidden shrink-0"
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-[13px] font-semibold text-foreground leading-none truncate">
                  Auto Garden
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate">
                  Workshop Management
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Search shortcut ── */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <button className="w-full h-8 flex items-center gap-2 px-2.5 rounded-md border border-border bg-muted/40 text-muted-foreground text-xs hover:border-border/80 hover:bg-muted transition-all">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] bg-background border border-border rounded px-1 py-0.5">⌘K</kbd>
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5 px-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (!item.roles) return true;
            return item.roles.includes(user?.role ?? "");
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="h-2" />}

              {visibleItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                  />
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-border p-2 shrink-0 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 text-[11px] font-bold shrink-0">
              {getInitials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.full_name}</p>
              <p className="text-[10px] text-muted-foreground capitalize truncate">{user.role.replace("_", " ")}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors",
            collapsed ? "h-9 justify-center" : "gap-2.5 px-2 py-2",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-xs">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarItem({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block">
      <div
        className={cn(
          "relative flex items-center rounded-lg transition-all duration-150",
          collapsed ? "h-9 justify-center" : "gap-2.5 px-2 py-2 h-9",
          isActive
            ? "bg-brand-100 text-brand-800 dark:bg-brand-50/10 dark:text-brand-400"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-lg bg-brand-100 dark:bg-brand-50/10"
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        <Icon className="w-4 h-4 relative z-10 shrink-0" />

        {!collapsed && (
          <span className="text-[13px] font-medium relative z-10 flex-1 truncate">
            {item.label}
          </span>
        )}

        {!collapsed && item.badge !== undefined && (
          <span className="relative z-10 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}