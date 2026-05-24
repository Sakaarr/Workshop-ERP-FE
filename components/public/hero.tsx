"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, Shield, Clock, Star, Zap } from "lucide-react";

function FloatingParticle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-amber-400/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = [
  { x: 10, y: 20, delay: 0,   size: 4 },
  { x: 85, y: 15, delay: 1.5, size: 6 },
  { x: 20, y: 70, delay: 0.8, size: 3 },
  { x: 75, y: 60, delay: 2.2, size: 5 },
  { x: 50, y: 85, delay: 1.1, size: 4 },
  { x: 92, y: 45, delay: 0.3, size: 3 },
  { x: 5,  y: 50, delay: 1.8, size: 5 },
  { x: 60, y: 10, delay: 2.5, size: 4 },
  { x: 35, y: 40, delay: 0.6, size: 3 },
  { x: 45, y: 55, delay: 3.1, size: 6 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

      {/* ── Multi-layer background ── */}
      <div className="absolute inset-0 pointer-events-none select-none">

        {/* Base radial gradient */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)" }}
        />

        {/* Diagonal stripe texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 48px)`,
          }}
        />

        {/* Fine dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated glow orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 60%)" }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

        {/* Horizontal scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
      </div>

      {/* ── Decorative gear icon (large, faint) ── */}
      <motion.div
        className="absolute right-[8%] top-[20%] opacity-[0.04] pointer-events-none hidden lg:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <Wrench className="w-[280px] h-[280px] text-amber-400" strokeWidth={0.5} />
      </motion.div>
      <motion.div
        className="absolute left-[4%] bottom-[20%] opacity-[0.03] pointer-events-none hidden lg:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <Zap className="w-[180px] h-[180px] text-amber-400" strokeWidth={0.5} />
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] backdrop-blur-sm mb-8"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-amber-400"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">
            Bharatpur's Premier Auto Workshop
          </span>
          <motion.span
            className="w-2 h-2 rounded-full bg-amber-400"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </motion.div>

        {/* Main heading — staggered chars */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl lg:text-[76px] font-bold text-white leading-[1.02] tracking-tight mb-6"
        >
          Your vehicle,
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 text-amber-400">our expertise.</span>
            <motion.span
              className="absolute inset-0 bg-amber-400/10 rounded-lg blur-xl -z-10"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl text-white/40 max-w-xl mx-auto leading-relaxed mb-10"
        >
          Professional automobile repair and servicing in Bharatpur, Chitwan.
          Trusted by hundreds of vehicle owners across the region.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
          >
            Book a Service
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.a>
          <motion.a
            href="#services"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/[0.12] text-white/70 text-sm font-semibold hover:text-white hover:border-white/25 hover:bg-white/[0.04] backdrop-blur-sm transition-all"
          >
            Explore Services
          </motion.a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center justify-center gap-2 mt-14 flex-wrap"
        >
          {[
            { icon: Shield, label: "Certified Mechanics",  value: "12+" },
            { icon: Star,   label: "Happy Customers",      value: "500+" },
            { icon: Clock,  label: "Years Experience",     value: "10+" },
            { icon: Wrench, label: "Vehicles Serviced",    value: "2000+" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all"
              >
                <Icon className="w-4 h-4 text-amber-400/70" />
                <span className="text-xl font-bold text-white">{stat.value}</span>
                <span className="text-[11px] text-white/30">{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[11px] text-white/20 uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}