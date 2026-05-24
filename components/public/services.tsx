"use client";

import { motion } from "framer-motion";
import { Wrench, Zap, Settings, Droplets, Wind, Shield } from "lucide-react";

const SERVICES = [
  { icon: Wrench,   title: "Engine Repair",        desc: "Complete engine diagnostics, overhaul, and repair by certified mechanics." },
  { icon: Zap,      title: "Electrical Systems",   desc: "Battery, alternator, wiring diagnosis and repair for all vehicle types." },
  { icon: Settings, title: "Routine Servicing",    desc: "Oil change, filter replacement, and full vehicle inspection packages." },
  { icon: Droplets, title: "Brake & Clutch",       desc: "Brake pad replacement, clutch adjustment and full hydraulic service." },
  { icon: Wind,     title: "AC Service",            desc: "Air conditioning recharge, repair and full climate system diagnostics." },
  { icon: Shield,   title: "Wheel Alignment",      desc: "Precision wheel alignment and balancing for safe, smooth driving." },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">What We Do</p>
          <h2 className="text-4xl font-bold text-white">Expert services for<br />every vehicle need</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{service.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}