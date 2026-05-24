"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Settings, Moon, Sun, Monitor, Loader2, Shield, Bell, Building2, Key } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { staffApi } from "@/lib/api/staff";
import { cn } from "@/lib/utils";

const pwSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type PwForm = z.infer<typeof pwSchema>;

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore(s => s.user);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const pwMutation = useMutation({
    mutationFn: (data: PwForm) => staffApi.changeMyPassword(data.current_password, data.new_password),
    onSuccess: () => { toast.success("Password changed successfully"); reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to change password"),
  });

  const ic = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

  const THEMES = [
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Settings" />
      <div className="flex-1 p-6 max-w-[800px] w-full mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and application preferences</p>
        </div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader icon={Building2} title="Profile" description="Your account information" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-50/10 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xl font-bold shrink-0">
              {user?.full_name?.charAt(0) ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="text-xs font-medium text-brand-600 bg-brand-100 dark:bg-brand-50/10 px-2 py-0.5 rounded capitalize mt-1 inline-block">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader icon={Sun} title="Appearance" description="Customize the look and feel" />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-3 block">Theme</label>
            <div className="flex gap-2">
              {THEMES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-xl border transition-all",
                      theme === t.value
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <Icon className={cn("w-5 h-5", theme === t.value ? "text-foreground" : "text-muted-foreground")} />
                    <span className={cn("text-xs font-medium", theme === t.value ? "text-foreground" : "text-muted-foreground")}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Business info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader icon={Building2} title="Business Information" description="Auto Garden Pvt. Ltd. details" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Business Name", "Auto Garden Pvt. Ltd."],
              ["Location", "Bharatpur, Chitwan, Nepal"],
              ["VAT Rate", "13%"],
              ["Currency", "NPR (Nepali Rupee)"],
            ].map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            Business details are configured server-side. Contact your system administrator to update.
          </p>
        </motion.div>

        {/* Security — change password */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader icon={Key} title="Security" description="Update your login password" />
          <form onSubmit={handleSubmit(d => pwMutation.mutate(d))} className="space-y-4 max-w-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Current Password</label>
              <input {...register("current_password")} type="password" placeholder="Your current password" className={ic(!!errors.current_password)} />
              {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <input {...register("new_password")} type="password" placeholder="Min. 8 characters" className={ic(!!errors.new_password)} />
              {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
              <input {...register("confirm_password")} type="password" placeholder="Repeat new password" className={ic(!!errors.confirm_password)} />
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={pwMutation.isPending}
              className="h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {pwMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </motion.button>
          </form>
        </motion.div>

        {/* System info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader icon={Settings} title="System" description="Application information" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Version", "1.0.0"],
              ["Stack", "Next.js 15 + FastAPI"],
              ["Database", "PostgreSQL 16"],
              ["Environment", process.env.NODE_ENV ?? "development"],
            ].map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="font-medium text-foreground font-mono text-xs">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}