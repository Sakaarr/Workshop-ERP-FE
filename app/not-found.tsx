"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, AlertTriangle, ArrowLeft, Home, RotateCcw } from "lucide-react";

const FLOATING_PARTS = [
  { emoji: "🔧", x: 8,  y: 15, delay: 0,   size: "text-3xl" },
  { emoji: "⚙️", x: 88, y: 10, delay: 0.8, size: "text-4xl" },
  { emoji: "🔩", x: 5,  y: 65, delay: 1.6, size: "text-2xl" },
  { emoji: "🛠️", x: 90, y: 70, delay: 0.4, size: "text-3xl" },
  { emoji: "⚙️", x: 50, y: 8,  delay: 1.2, size: "text-2xl" },
  { emoji: "🔧", x: 75, y: 85, delay: 2,   size: "text-2xl" },
  { emoji: "🔩", x: 20, y: 90, delay: 0.6, size: "text-3xl" },
  { emoji: "🛞", x: 70, y: 30, delay: 1.8, size: "text-3xl" },
];

function SpinningGear({ size, x, y, speed = 20, reverse = false }: { size: number; x: string; y: string; speed?: number; reverse?: boolean }) {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-[0.06]"
      style={{ left: x, top: y }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" className="text-amber-500">
        <path d="M43.3 5.7L40 20.2C37.1 21 34.3 22.2 31.8 23.8L18.4 17.4L5.7 30.1L12.1 43.5C10.5 46 9.3 48.8 8.5 51.7L-5 55V70H8.5C9.3 72.9 10.5 75.7 12.1 78.2L5.7 91.6L18.4 104.3L31.8 97.9C34.3 99.5 37.1 100.7 40 101.5L43.3 115H58.7L62 101.5C64.9 100.7 67.7 99.5 70.2 97.9L83.6 104.3L96.3 91.6L89.9 78.2C91.5 75.7 92.7 72.9 93.5 70H107V55L93.5 51.7C92.7 48.8 91.5 46 89.9 43.5L96.3 30.1L83.6 17.4L70.2 23.8C67.7 22.2 64.9 21 62 20.2L58.7 5.7H43.3ZM51 35C59.8 35 67 42.2 67 51C67 59.8 59.8 67 51 67C42.2 67 35 59.8 35 51C35 42.2 42.2 35 51 35Z"/>
      </svg>
    </motion.div>
  );
}

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center overflow-hidden relative px-6">

      {/* ── Background effects ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Radial amber glow */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)" }}
        />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(10,10,11,0.8) 100%)" }}
        />

        {/* Spinning gears */}
        <SpinningGear size={180} x="-4%" y="10%" speed={25} />
        <SpinningGear size={120} x="82%" y="5%"  speed={18} reverse />
        <SpinningGear size={200} x="75%" y="60%" speed={30} />
        <SpinningGear size={90}  x="10%" y="70%" speed={15} reverse />
        <SpinningGear size={60}  x="45%" y="-2%" speed={12} />

        {/* Floating parts */}
        {FLOATING_PARTS.map((part, i) => (
          <motion.div
            key={i}
            className={`absolute pointer-events-none ${part.size}`}
            style={{ left: `${part.x}%`, top: `${part.y}%` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.4, 0], y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: part.delay, ease: "easeInOut" }}
          >
            {part.emoji}
          </motion.div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 text-center max-w-lg">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg">Auto Garden</span>
        </motion.div>

        {/* 404 number — the hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="text-[140px] sm:text-[180px] font-black text-white/[0.04] leading-none tracking-tighter select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[80px] sm:text-[100px] font-black leading-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </div>
          </div>
        </motion.div>

        {/* Warning icon + text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-8"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Page Not Found</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Vehicle not in the bay
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
            Looks like this page drove off without a gate pass.
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Diagnostic box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 mb-8 text-left font-mono text-xs"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-white/30 ml-2">diagnostic_report.log</span>
          </div>
          <div className="space-y-1">
            <div><span className="text-amber-400/70">ERROR</span> <span className="text-white/50">→</span> <span className="text-white/40">HTTP 404 — Resource not found</span></div>
            <div><span className="text-blue-400/70">PATH </span> <span className="text-white/50">→</span> <span className="text-white/40">Page has left the workshop</span></div>
            <div><span className="text-green-400/70">FIX  </span> <span className="text-white/50">→</span> <span className="text-white/40">Navigate to a valid route below</span></div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.1] text-white/70 text-sm font-medium hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </motion.button>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Home className="w-4 h-4" /> Back to Dashboard
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.1] text-white/70 text-sm font-medium hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reload
          </motion.button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex items-center justify-center gap-5"
        >
          {[
            { href: "/dashboard/jobs", label: "Job Cards" },
            { href: "/dashboard/customers", label: "Customers" },
            { href: "/dashboard/inventory", label: "Inventory" },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/15 text-xs mt-8"
        >
          Auto Garden Pvt. Ltd. · Bharatpur, Chitwan, Nepal
        </motion.p>
      </div>
    </div>
  );
}