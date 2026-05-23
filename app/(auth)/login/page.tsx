"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Wrench, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) =>
    login({ email: data.email, password: data.password });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0b] flex">
      {/* ── Geometric background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {/* Large angled stripe */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              #f59e0b 0px,
              #f59e0b 1px,
              transparent 1px,
              transparent 60px
            )`,
          }}
        />
        {/* Warm glow top-left */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        {/* Subtle glow bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Left panel — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 p-14 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Auto Garden
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs tracking-widest uppercase font-medium">
                Workshop Management
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Built for the<br />
              <span className="text-amber-400">garage floor.</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed max-w-[360px]">
              Manage job cards, billing, inventory, and customer records — all from one place
              designed for real workshop operations.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Job cards", value: "∞" },
              { label: "Inventory items", value: "Unlimited" },
              { label: "Users", value: "Multi-role" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="text-white font-semibold text-lg">{stat.value}</div>
                <div className="text-white/30 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-sm">
          © {new Date().getFullYear()} Auto Garden Pvt. Ltd. · Bharatpur, Chitwan
        </p>
      </motion.div>

      {/* ── Vertical divider ── */}
      <div className="hidden lg:block w-px bg-white/[0.06] shrink-0" />

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px] space-y-8"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-[15px]">Auto Garden</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
            <p className="text-white/40 text-sm">
              Enter your credentials to access the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium tracking-wide uppercase">
                Email address
              </label>
              <div className="relative">
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@autogarden.com.np"
                  className={cn(
                    "w-full h-11 px-4 rounded-lg text-sm text-white placeholder:text-white/20",
                    "bg-white/[0.05] border transition-all duration-200 outline-none",
                    "focus:bg-white/[0.07] focus:border-amber-500/60",
                    errors.email
                      ? "border-red-500/60 bg-red-500/5"
                      : "border-white/[0.08] hover:border-white/[0.14]",
                  )}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-11 px-4 pr-11 rounded-lg text-sm text-white placeholder:text-white/20",
                    "bg-white/[0.05] border transition-all duration-200 outline-none",
                    "focus:bg-white/[0.07] focus:border-amber-500/60",
                    errors.password
                      ? "border-red-500/60 bg-red-500/5"
                      : "border-white/[0.08] hover:border-white/[0.14]",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoggingIn}
              whileHover={{ scale: isLoggingIn ? 1 : 1.01 }}
              whileTap={{ scale: isLoggingIn ? 1 : 0.99 }}
              className={cn(
                "w-full h-11 rounded-lg font-semibold text-sm",
                "bg-amber-500 text-black hover:bg-amber-400",
                "transition-all duration-200 flex items-center justify-center gap-2",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "mt-2",
              )}
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-white/20 text-xs text-center">
            Auto Garden Workshop Management System v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}
