"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  Sun, Moon, Monitor, Loader2, Key, Building2,
  Settings, Camera, Check, User,
} from "lucide-react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/layout/topbar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { staffApi } from "@/lib/api/staff";
import { cn, getInitials } from "@/lib/utils";

const pwSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const profileSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
});

type PwForm = z.infer<typeof pwSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

const AVATAR_COLORS = [
  "bg-amber-500", "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
];

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border border-border rounded-xl p-6 space-y-5", className)}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
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
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const [selectedColor, setSelectedColor] = useState(0);

  const { data: me } = useQuery({
    queryKey: ["staff", "me"],
    queryFn: staffApi.me,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { full_name: me?.full_name ?? "", phone: me?.phone ?? "" },
  });

  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => staffApi.updateMyProfile(data),
    onSuccess: (updated) => {
      toast.success("Profile updated");
      setUser(updated as any);
      qc.invalidateQueries({ queryKey: ["staff", "me"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to update profile"),
  });

  const avatarMutation = useMutation({
    mutationFn: (avatar_url: string) => staffApi.updateMyProfile({ avatar_url }),
    onSuccess: (updated) => {
      toast.success("Avatar updated");
      setUser(updated as any);
      qc.invalidateQueries({ queryKey: ["staff", "me"] });
    },
  });

  const pwMutation = useMutation({
    mutationFn: (data: PwForm) => staffApi.changeMyPassword(data.current_password, data.new_password),
    onSuccess: () => { toast.success("Password changed"); pwForm.reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to change password"),
  });

  const ic = (err: boolean) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
    err ? "border-destructive" : "border-border",
  );

  const THEMES = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark",  label: "Dark",  icon: Moon },
    { value: "system",label: "System",icon: Monitor },
  ];

  const displayName = me?.full_name ?? user?.full_name ?? "";
  const currentAvatar = me?.avatar_url ?? user?.avatar_url;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Settings" />
      <div className="flex-1 p-6 max-w-[800px] w-full mx-auto space-y-6">

        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

        {/* ── Profile ── */}
        <SectionCard>
          <SectionHeader icon={User} title="Profile" description="Update your name, phone and avatar" />

          {/* Avatar selector */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold",
                currentAvatar?.startsWith("color:") ? currentAvatar.replace("color:", "") : "bg-brand-500",
              )}>
                {currentAvatar && !currentAvatar.startsWith("color:")
                  ? <img src={currentAvatar} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
                  : getInitials(displayName)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Pick an avatar color</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_COLORS.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(i);
                      avatarMutation.mutate(`color:${color}`);
                    }}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all",
                      color,
                      selectedColor === i && "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110",
                    )}
                  />
                ))}
                <button
                  onClick={() => avatarMutation.mutate("")}
                  className="w-7 h-7 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-foreground transition-colors flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <form
            onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  {...profileForm.register("full_name")}
                  placeholder="Your full name"
                  className={ic(!!profileForm.formState.errors.full_name)}
                />
                {profileForm.formState.errors.full_name && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input
                  {...profileForm.register("phone")}
                  placeholder="98XXXXXXXX"
                  className={ic(false)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                value={me?.email ?? ""}
                disabled
                className="w-full h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground bg-muted/40 cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground capitalize">
                Role: <span className="font-medium text-foreground">{me?.role?.replace("_", " ")}</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                Member since {me ? new Date(me.created_at).toLocaleDateString() : "—"}
              </span>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={profileMutation.isPending}
              className="h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {profileMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Check className="w-4 h-4" />}
              Save Profile
            </motion.button>
          </form>
        </SectionCard>

        {/* ── Appearance ── */}
        <SectionCard>
          <SectionHeader icon={Sun} title="Appearance" description="Choose your preferred theme" />
          <div className="flex gap-3">
            {THEMES.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 py-4 px-4 rounded-xl border transition-all",
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
        </SectionCard>

        {/* ── Business Info ── */}
        <SectionCard>
          <SectionHeader icon={Building2} title="Business" description="Auto Garden Pvt. Ltd. details" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Business Name", "Auto Garden Pvt. Ltd."],
              ["Location", "Bharatpur, Chitwan, Nepal"],
              ["VAT Rate", "13%"],
              ["Currency", "NPR (Nepali Rupee)"],
            ].map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="font-medium text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Security ── */}
        <SectionCard>
          <SectionHeader icon={Key} title="Security" description="Update your login password" />
          <form onSubmit={pwForm.handleSubmit(d => pwMutation.mutate(d))} className="space-y-4 max-w-sm">
            {[
              { name: "current_password" as const, label: "Current Password", placeholder: "Your current password" },
              { name: "new_password" as const,     label: "New Password",     placeholder: "Min. 8 characters" },
              { name: "confirm_password" as const, label: "Confirm Password", placeholder: "Repeat new password" },
            ].map(field => (
              <div key={field.name} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                <input
                  {...pwForm.register(field.name)}
                  type="password"
                  placeholder={field.placeholder}
                  className={ic(!!pwForm.formState.errors[field.name])}
                />
                {pwForm.formState.errors[field.name] && (
                  <p className="text-xs text-destructive">{pwForm.formState.errors[field.name]?.message}</p>
                )}
              </div>
            ))}
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
        </SectionCard>

        {/* ── System ── */}
        <SectionCard>
          <SectionHeader icon={Settings} title="System" description="Application information" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Version", "1.0.0"],
              ["Stack", "Next.js 15 + FastAPI"],
              ["Database", "PostgreSQL 16"],
              ["Environment", process.env.NODE_ENV ?? "development"],
            ].map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="font-medium text-foreground font-mono text-xs mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}