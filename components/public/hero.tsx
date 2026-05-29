"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

// ── Odometer-style number counter ──────────────────────────────────────────
function OdometerNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const digits = value.replace(/\D/g, "").split("").map(Number);
  return (
    <span className="inline-flex items-baseline gap-0.5 tabular-nums">
      {digits.map((d, i) => (
        <motion.span
          key={i}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.7 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {d}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {suffix}
      </motion.span>
    </span>
  );
}

// ── Noise SVG overlay for grain effect ─────────────────────────────────────
function GrainOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay" aria-hidden>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ── Magnetic button ─────────────────────────────────────────────────────────
function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const x = useSpring(pos.x, { stiffness: 200, damping: 20 });
  const y = useSpring(pos.y, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.22 });
  };
  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ── Typewriter headline ─────────────────────────────────────────────────────
const HEADLINE_LINE1 = "Your vehicle,";
const HEADLINE_LINE2_WORDS = ["our expertise."];

function TypewriterLine({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 0.9, delay, ease: [0.77, 0, 0.175, 1] }}
      className="inline-block"
    >
      {text}
    </motion.span>
  );
}

// ── Horizontal ticker tape ──────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Engine Overhaul", "Brake Service", "AC Repair", "Oil Change",
  "Transmission", "Electrical", "Suspension", "Wheel Alignment",
];
function TickerTape() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-amber-500/10 py-2 bg-black/20 backdrop-blur-sm">
      <motion.div
        className="flex gap-12 whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500/40 select-none">
            <span className="mr-12">◆</span>{item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Animated wrench SVG (hand-drawn feel) ──────────────────────────────────
function WrenchIllustration() {
  return (
    <motion.svg
      width="320" height="320"
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-[5%] top-[15%] hidden xl:block opacity-[0.055]"
      initial={{ rotate: -15, opacity: 0 }}
      animate={{ rotate: 0, opacity: 0.055 }}
      transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path
        d="M240 40 C270 50, 290 80, 285 110 C280 135, 260 150, 240 145
           L80 300 C65 315, 40 312, 28 300 C16 288, 18 265, 32 252
           L188 92 C178 72, 185 45, 205 33 C218 26, 233 28, 240 40Z"
        stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
      />
      <motion.circle cx="246" cy="88" r="28"
        stroke="#f59e0b" strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 1.6 }}
      />
      <motion.path
        d="M225 68 L267 108 M267 68 L225 108"
        stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
      />
    </motion.svg>
  );
}

// ── Animated grid lines (blueprint effect) ─────────────────────────────────
function BlueprintGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      <defs>
        <pattern id="bp-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(245,158,11,0.04)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="bp-fade" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="bp-mask">
          <rect width="100%" height="100%" fill="url(#bp-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" mask="url(#bp-mask)" />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { value: "12", suffix: "+", label: "Certified mechanics" },
    { value: "500", suffix: "+", label: "Happy customers" },
    { value: "10", suffix: "+", label: "Years experience" },
    { value: "2000", suffix: "+", label: "Vehicles serviced" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[#080809]"
    >
      {/* ── Layered atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        <BlueprintGrid />
        <GrainOverlay />

        {/* Amber aurora — top center */}
        <div
          className="absolute -top-[20%] left-[20%] w-[60%] h-[70%] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(245,158,11,0.09) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        {/* Cool blue counter-light — bottom right */}
        <div
          className="absolute -bottom-[10%] -right-[5%] w-[45%] h-[55%] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(56,100,220,0.045) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
        />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080809] to-transparent" />
      </div>

      {/* ── Decorative wrench ── */}
      <WrenchIllustration />

      {/* ── Parallax content wrapper ── */}
      <motion.div
        style={{ y: parallaxY, opacity: fadeOut }}
        className="relative z-10 w-full max-w-[1100px] mx-auto px-6 md:px-12"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex items-center gap-3"
        >
          <div className="h-px flex-1 max-w-[48px] bg-amber-500/30" />
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-400/70">
            Bharatpur's Premier Auto Workshop
          </span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.div>

        {/* Headline — reveal-from-behind */}
        <h1 className="font-bold text-white leading-[1.0] tracking-tight mb-7 overflow-hidden">
          {/* Line 1 */}
          <div className="block overflow-hidden">
            <motion.span
              className="block text-[clamp(52px,7vw,92px)]"
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Your vehicle,
            </motion.span>
          </div>
          {/* Line 2 — amber with underline animation */}
          <div className="block overflow-hidden relative">
            <motion.span
              className="block text-[clamp(52px,7vw,92px)] text-amber-400 relative"
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              our expertise.
              <motion.span
                className="absolute bottom-1 left-0 h-[3px] bg-amber-500/40 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.span>
          </div>
        </h1>

        {/* Body copy + CTA — side by side on large screens */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16 mb-16">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[17px] text-white/38 leading-relaxed max-w-[360px]"
          >
            Professional automobile repair and servicing in Bharatpur, Chitwan.
            Trusted by hundreds of vehicle owners across the region.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <MagneticButton
              href="#contact"
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-amber-500 text-black font-bold text-[13px] tracking-wide hover:bg-amber-400 transition-colors overflow-hidden"
            >
              {/* Shimmer */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                initial={{ x: "-120%" }}
                animate={{ x: "220%" }}
                transition={{ duration: 1.2, delay: 1.5, repeat: Infinity, repeatDelay: 4 }}
              />
              <span className="relative">Book a Service</span>
              <motion.svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </MagneticButton>

            <MagneticButton
              href="#services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-white/10 text-white/55 text-[13px] font-semibold tracking-wide hover:text-white hover:border-white/22 transition-all"
            >
              Explore Services
            </MagneticButton>
          </motion.div>
        </div>

        {/* Stats — horizontal line style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="grid grid-cols-2 sm:grid-cols-4 border border-white/[0.06] rounded-xl overflow-hidden"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="relative flex flex-col gap-1 px-6 py-5 border-r border-b border-white/[0.06] last:border-r-0 hover:bg-white/[0.02] transition-colors group"
            >
              {/* Accent line on hover */}
              <motion.div
                className="absolute top-0 left-6 right-6 h-[1.5px] bg-amber-500/0 group-hover:bg-amber-500/50 transition-colors duration-300 rounded-full"
              />
              <div className="text-[28px] font-bold text-white leading-none">
                <OdometerNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[12px] text-white/30 leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Ticker tape ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute bottom-0 left-0 right-0"
      >
        <TickerTape />
      </motion.div>

      {/* ── Scroll indicator — morphing bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-10 right-8 flex flex-col items-center gap-2 hidden md:flex"
      >
        <motion.span
          className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/18"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </motion.span>
        <div className="w-px h-12 overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-400/60 to-transparent"
            animate={{ height: ["0%", "100%", "0%"], top: ["0%", "0%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-white/6" />
        </div>
      </motion.div>
    </section>
  );
}