"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Download,
  Calendar, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Topbar } from "@/components/layout/topbar";
import { analyticsApi } from "@/lib/api/analytics";
import { daybookApi } from "@/lib/api/daybook";
import { formatCurrency, cn } from "@/lib/utils";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function daysAgoStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-elevated text-xs space-y-1">
      <p className="font-medium text-foreground mb-1">{label}</p>
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

export default function ReportsPage() {
  const [range, setRange] = useState<7 | 14 | 30>(30);

  const { data: chartData } = useQuery({
    queryKey: ["analytics", "revenue-chart", range],
    queryFn: () => analyticsApi.revenueChart(range),
  });

  const { data: stats } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: analyticsApi.dashboard,
  });

  const { data: rangeData } = useQuery({
    queryKey: ["daybook-range", range],
    queryFn: () => daybookApi.range(daysAgoStr(range), todayStr()),
  });

  const formatted = chartData?.map(p => ({
    date: new Date(p.date + "T00:00").toLocaleDateString("en-NP", { month: "short", day: "numeric" }),
    income: parseFloat(p.income),
    expense: parseFloat(p.expense),
    net: parseFloat(p.income) - parseFloat(p.expense),
  })) ?? [];

  const totalIncome = formatted.reduce((s, p) => s + p.income, 0);
  const totalExpense = formatted.reduce((s, p) => s + p.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Reports" />
      <div className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Financial and operational overview</p>
          </div>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  range === d ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-muted/60")}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: `Income (${range}d)`, value: totalIncome, icon: TrendingUp, color: "text-success", bg: "bg-success-muted" },
            { label: `Expenses (${range}d)`, value: totalExpense, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Net Profit", value: totalNet, icon: BarChart3, color: totalNet >= 0 ? "text-success" : "text-destructive", bg: totalNet >= 0 ? "bg-success-muted" : "bg-destructive/10" },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", card.bg)}>
                  <Icon className={cn("w-5 h-5", card.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={cn("text-xl font-bold mt-0.5", card.color)}>{formatCurrency(card.value)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h2 className="text-[13px] font-semibold text-foreground mb-5">Revenue vs Expenses — {range} days</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="reportIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reportExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#16a34a" strokeWidth={2} fill="url(#reportIncome)" dot={false} activeDot={{ r: 4, fill: "#16a34a" }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" strokeWidth={2} fill="url(#reportExpense)" dot={false} activeDot={{ r: 4, fill: "#dc2626" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Net profit bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h2 className="text-[13px] font-semibold text-foreground mb-5">Daily Net Profit</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]}
                fill="#f59e0b"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Job stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Jobs This Month", value: stats?.jobs.completed_this_month ?? 0 },
            { label: "Active Jobs", value: stats?.jobs.total_active ?? 0 },
            { label: "New Customers", value: stats?.customers.new_this_month ?? 0 },
            { label: "Low Stock Items", value: stats?.inventory.low_stock_count ?? 0 },
          ].map((item, i) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}