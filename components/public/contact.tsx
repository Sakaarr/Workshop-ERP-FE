"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="text-4xl font-bold text-white">Book a service or<br />ask a question</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Phone,   title: "Call Us",      value: "+977-56-XXXXXX", sub: "Mon–Sat, 8am–6pm" },
              { icon: MapPin,  title: "Find Us",      value: "Bharatpur, Chitwan", sub: "Near Main Chowk" },
              { icon: Clock,   title: "Working Hours", value: "8:00 AM – 6:00 PM", sub: "Closed on Sundays" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{item.title}</p>
                    <p className="text-white font-semibold mt-0.5">{item.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Send className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Received!</h3>
                <p className="text-white/40 text-sm max-w-xs">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", vehicle: "", message: "" }); }} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name",    placeholder: "Your full name",       label: "Name" },
                  { key: "phone",   placeholder: "Your phone number",    label: "Phone" },
                  { key: "vehicle", placeholder: "Vehicle type & model", label: "Vehicle" },
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">{field.label}</label>
                    <input
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      required
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Message / Issue</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe the issue or service you need..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.07] transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}