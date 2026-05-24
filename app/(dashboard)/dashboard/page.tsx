"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, ClipboardList, Users,
  Package, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Clock, Wrench, CheckCircle2, Crown, Phone,
  BarChart3, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { analyticsApi } from "@/lib/api/analytics";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

// ── Stat card ───────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, iconBg, trend, delay = 0,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string;
  trend?: { value: number; label: string };
  delay?: number;
}) {
  const positive = (trend?.value ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
          {positive
            ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
            : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />}
          <span className={cn("text-xs font-semibold", positive ? "text-success" : "text-destructive")}>
            {positive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-elevated text-xs space-y-1">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [chartDays, setChartDays] = useState(14);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: analyticsApi.dashboard,
    refetchInterval: 60_000,
  });

  const { data: chartData } = useQuery({
    queryKey: ["analytics", "revenue-chart", chartDays],
    queryFn: () => analyticsApi.revenueChart(chartDays),
  });

  const { data: pieData } = useQuery({
    queryKey: ["analytics", "job-status-chart"],
    queryFn: analyticsApi.jobStatusChart,
  });

  const { data: topCustomers } = useQuery({
    queryKey: ["analytics", "top-customers"],
    queryFn: () => analyticsApi.topCustomers(5),
  });

  const formattedChart = chartData?.map(p => ({
    date: new Date(p.date + "T00:00").toLocaleDateString("en-NP", { month: "short", day: "numeric" }),
    income: parseFloat(p.income),
    expense: parseFloat(p.expense),
  })) ?? [];

  const activePieData = pieData?.filter(p => p.count > 0) ?? [];

  return (
    <div className="flex flex-col min-h-full">
      <Topbar />
      <div className="flex-1 p-6 space-y-6 max-w-[1400px] w-full mx-auto">

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">
              {getGreeting()}, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-NP", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard/jobs/new")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <ClipboardList className="w-4 h-4" /> New Job Card
            </motion.button>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Today's Revenue" delay={0}
                value={formatCurrency(stats?.revenue.today ?? 0)}
                sub={`Month: ${formatCurrency(stats?.revenue.this_month ?? 0)}`}
                icon={TrendingUp} iconBg="bg-success-muted text-success"
                trend={{ value: stats?.revenue.growth_percent ?? 0, label: "vs last month" }}
              />
              <StatCard
                label="Active Jobs" delay={0.05}
                value={stats?.jobs.total_active ?? 0}
                sub={`${stats?.jobs.completed_today ?? 0} completed today`}
                icon={ClipboardList} iconBg="bg-brand-100 dark:bg-brand-50/10 text-brand-600"
              />
              <StatCard
                label="Total Customers" delay={0.1}
                value={stats?.customers.total ?? 0}
                sub={`${stats?.customers.new_this_month ?? 0} new this month`}
                icon={Users} iconBg="bg-info-muted text-info"
              />
              <StatCard
                label="Low Stock Items" delay={0.15}
                value={stats?.inventory.low_stock_count ?? 0}
                sub={`${stats?.inventory.total_items ?? 0} total parts`}
                icon={AlertTriangle} iconBg="bg-warning-muted text-warning"
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue area chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Revenue vs Expenses</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Daily breakdown</p>
              </div>
              <div className="flex gap-1">
                {[7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                      chartDays === d ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/60")}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={formattedChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#16a34a" strokeWidth={2} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: "#16a34a" }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" strokeWidth={2} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: "#dc2626" }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Job status pie */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="mb-4">
              <h2 className="text-[13px] font-semibold text-foreground">Job Status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Current breakdown</p>
            </div>

            {activePieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={activePieData}
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {activePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {activePieData.map(p => (
                    <div key={p.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-xs text-muted-foreground">{p.status}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                No active jobs
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Job queue */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold text-foreground">Job Queue</h2>
              </div>
              <button onClick={() => router.push("/dashboard/jobs")} className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Waiting", count: stats?.jobs.waiting, color: "bg-warning", icon: Clock },
                { label: "Diagnosing", count: stats?.jobs.diagnosing, color: "bg-info", icon: Wrench },
                { label: "Repairing", count: stats?.jobs.repairing, color: "bg-brand-500", icon: Wrench },
                { label: "Needs Parts", count: stats?.jobs.waiting_parts, color: "bg-warning", icon: Package },
                { label: "Ready", count: stats?.jobs.ready, color: "bg-success", icon: CheckCircle2 },
              ].map(item => {
                const Icon = item.icon;
                const total = stats?.jobs.total_active || 1;
                const pct = ((item.count ?? 0) / total) * 100;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{item.count ?? 0}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className={cn("h-full rounded-full", item.color)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top customers */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <h2 className="text-[13px] font-semibold text-foreground">Top Customers</h2>
              </div>
              <button onClick={() => router.push("/dashboard/customers")} className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                View all
              </button>
            </div>
            <div className="divide-y divide-border">
              {topCustomers?.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.job_count} jobs</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground shrink-0">{formatCurrency(c.total_spent)}</span>
                </motion.div>
              ))}
              {(!topCustomers || topCustomers.length === 0) && (
                <div className="py-8 text-center text-xs text-muted-foreground">No data yet</div>
              )}
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-[13px] font-semibold text-foreground">This Month</h2>
              {[
                { label: "Jobs Completed", value: stats?.jobs.completed_this_month ?? 0, icon: CheckCircle2, color: "text-success" },
                { label: "New Customers", value: stats?.customers.new_this_month ?? 0, icon: Users, color: "text-info" },
                { label: "Outstanding", value: stats?.customers.with_outstanding ?? 0, icon: AlertTriangle, color: "text-warning" },
                { label: "Inventory Value", value: formatCurrency(stats?.inventory.total_value ?? 0), icon: Package, color: "text-brand-600" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <Icon className={cn("w-4 h-4", item.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New Customer", href: "/dashboard/customers", icon: Users },
                  { label: "New Job", href: "/dashboard/jobs/new", icon: ClipboardList },
                  { label: "Add Part", href: "/dashboard/inventory", icon: Package },
                  { label: "Day Book", href: "/dashboard/daybook", icon: BarChart3 },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.href)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-brand-200 hover:bg-brand-50/50 dark:hover:bg-brand-50/5 transition-all group"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-600 transition-colors" />
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}