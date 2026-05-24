"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Over 10 years of experience in automobile repair",
  "Genuine spare parts from trusted suppliers",
  "Transparent pricing — no hidden charges",
  "Digital job cards and service history",
  "Qualified and trained mechanics",
  "Quick turnaround on most repairs",
];

export function WhyUsSection() {
  return (
    <section id="about" className="py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Why Auto Garden</p>
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            We treat your vehicle<br />like our own.
          </h2>
          <p className="text-white/40 leading-relaxed mb-8">
            Located in the heart of Bharatpur, Chitwan, Auto Garden has been the trusted choice
            for vehicle owners seeking professional, honest, and reliable automobile service since 2012.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
          >
            Get in Touch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {POINTS.map((point, i) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-white/70">{point}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}