"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ClipboardList,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Wrench,
  Car,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor,
  delay = 0,
}: {
  label: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: React.ElementType;
  iconColor: string;
  delay?: number;
}) {
  const positive = (change?.value ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold text-foreground tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            iconColor
          )}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
          {positive ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-success" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
          )}

          <span
            className={cn(
              "text-xs font-medium",
              positive ? "text-success" : "text-destructive"
            )}
          >
            {positive ? "+" : ""}
            {change.value}%
          </span>

          <span className="text-xs text-muted-foreground">
            {change.label}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    class: string;
    icon: React.ElementType;
  }
> = {
  waiting: {
    label: "Waiting",
    class: "badge-waiting",
    icon: Clock,
  },

  diagnosing: {
    label: "Diagnosing",
    class: "badge-diagnosing",
    icon: Wrench,
  },

  repairing: {
    label: "Repairing",
    class: "badge-repairing",
    icon: Wrench,
  },

  waiting_parts: {
    label: "Needs Parts",
    class: "badge-waiting",
    icon: Package,
  },

  ready: {
    label: "Ready",
    class: "badge-ready",
    icon: CheckCircle2,
  },

  delivered: {
    label: "Delivered",
    class: "badge-delivered",
    icon: CheckCircle2,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.waiting;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
        config.class
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

const MOCK_STATS = {
  todayRevenue: 45800,
  revenueChange: 12.4,
  activeJobs: 8,
  jobsChange: 2,
  totalCustomers: 342,
  customersChange: 3.1,
  lowStockItems: 5,
};

const MOCK_RECENT_JOBS = [
  {
    id: "1",
    job_number: "JC-2411-0124",
    customer: "Ram Prasad Sharma",
    vehicle: "BA 1 CHA 2341 · Toyota Hilux",
    status: "repairing",
    created_at: new Date(
      Date.now() - 2 * 3600_000
    ).toISOString(),
  },

  {
    id: "2",
    job_number: "JC-2411-0123",
    customer: "Sita Devi Poudel",
    vehicle: "BA 2 PA 1122 · Honda City",
    status: "ready",
    created_at: new Date(
      Date.now() - 5 * 3600_000
    ).toISOString(),
  },

  {
    id: "3",
    job_number: "JC-2411-0122",
    customer: "Hari Bahadur KC",
    vehicle: "BA 3 KHA 9087 · Suzuki Alto",
    status: "diagnosing",
    created_at: new Date(
      Date.now() - 8 * 3600_000
    ).toISOString(),
  },

  {
    id: "4",
    job_number: "JC-2411-0121",
    customer: "Meena Thapa",
    vehicle: "BA 1 JA 5533 · Hyundai i20",
    status: "waiting_parts",
    created_at: new Date(
      Date.now() - 12 * 3600_000
    ).toISOString(),
  },

  {
    id: "5",
    job_number: "JC-2411-0120",
    customer: "Bijay Kumar Yadav",
    vehicle: "GA 1 TA 3321 · Mahindra Scorpio",
    status: "waiting",
    created_at: new Date(
      Date.now() - 24 * 3600_000
    ).toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const greeting = getGreeting();

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />

      <div className="flex-1 p-6 space-y-6 max-w-[1400px] w-full mx-auto">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">
              {greeting},{" "}
              {user?.full_name?.split(" ")[0] ?? "User"} 👋
            </h1>

            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-NP", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <motion.a
            href="/dashboard/jobs/new"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            New Job Card
          </motion.a>
        </motion.div>

        {/* Stats */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(MOCK_STATS.todayRevenue)}
            change={{
              value: MOCK_STATS.revenueChange,
              label: "vs yesterday",
            }}
            icon={TrendingUp}
            iconColor="bg-success-muted text-success"
          />

          <StatCard
            label="Active Jobs"
            value={MOCK_STATS.activeJobs}
            change={{
              value: MOCK_STATS.jobsChange,
              label: "since yesterday",
            }}
            icon={ClipboardList}
            iconColor="bg-brand-100 text-brand-600"
            delay={0.05}
          />

          <StatCard
            label="Total Customers"
            value={MOCK_STATS.totalCustomers}
            change={{
              value: MOCK_STATS.customersChange,
              label: "this month",
            }}
            icon={Users}
            iconColor="bg-info-muted text-info"
            delay={0.1}
          />

          <StatCard
            label="Low Stock Alerts"
            value={MOCK_STATS.lowStockItems}
            icon={AlertTriangle}
            iconColor="bg-warning-muted text-warning"
            delay={0.15}
          />
        </div>

        {/* Main Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Jobs */}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">
                  Active Job Cards
                </h2>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Today's workshop activity
                </p>
              </div>

              <a
                href="/dashboard/jobs"
                className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="divide-y divide-border">
              {MOCK_RECENT_JOBS.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.25 + i * 0.05,
                  }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground truncate">
                        {job.customer}
                      </span>

                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                        {job.job_number}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {job.vehicle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={job.status} />

                    <span className="text-[11px] text-muted-foreground hidden sm:block">
                      {formatDate(job.created_at, "relative")}
                    </span>

                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}

          <div className="space-y-4">
            {/* Job Status */}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h2 className="text-[13px] font-semibold text-foreground mb-4">
                Job Status
              </h2>

              <div className="space-y-2.5">
                {[
                  {
                    label: "Waiting",
                    count: 3,
                    color: "bg-warning",
                    total: 8,
                  },

                  {
                    label: "In Progress",
                    count: 3,
                    color: "bg-brand-500",
                    total: 8,
                  },

                  {
                    label: "Ready",
                    count: 2,
                    color: "bg-success",
                    total: 8,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>

                      <span className="text-xs font-medium text-foreground">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (item.count / item.total) * 100
                          }%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.4,
                          ease: "easeOut",
                        }}
                        className={cn(
                          "h-full rounded-full",
                          item.color
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h2 className="text-[13px] font-semibold text-foreground mb-3">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "New Customer",
                    icon: Users,
                    href: "/dashboard/customers/new",
                  },

                  {
                    label: "New Job Card",
                    icon: ClipboardList,
                    href: "/dashboard/jobs/new",
                  },

                  {
                    label: "Add Part",
                    icon: Package,
                    href: "/dashboard/inventory/new",
                  },

                  {
                    label: "Day Book",
                    icon: TrendingUp,
                    href: "/dashboard/daybook",
                  },
                ].map((action) => {
                  const Icon = action.icon;

                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-brand-200 hover:bg-brand-50/50 dark:hover:bg-brand-50/5 transition-all duration-200 group"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-600 transition-colors" />

                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                        {action.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";

  if (hour < 17) return "Good afternoon";

  return "Good evening";
}