"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Zap, AlertCircle, RotateCcw } from "lucide-react";
import { useBarcodeScanner } from "@/lib/hooks/use-barcode-scanner";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  description?: string;
}

export function BarcodeScanner({
  open,
  onClose,
  onScan,
  title = "Scan Barcode",
  description = "Point camera at the barcode",
}: BarcodeScannerProps) {
  const { isScanning, lastScan, error, startScanning, stopScanning, videoRef } =
    useBarcodeScanner((code) => {
      onScan(code);
      stopScanning();
      onClose();
    });

  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-[#0f0f10] border border-white/[0.08] rounded-2xl overflow-hidden shadow-dialog pointer-events-auto">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="text-xs text-white/40">{description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Camera viewport */}
              <div className="relative aspect-square bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />

                {/* Scanner overlay */}
                {isScanning && !error && (
                  <>
                    {/* Dark corners */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0"
                        style={{
                          background: `
                            radial-gradient(
                              ellipse 55% 55% at 50% 50%,
                              transparent 0%,
                              rgba(0,0,0,0.6) 100%
                            )
                          `,
                        }}
                      />
                    </div>

                    {/* Scan frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-52 h-52">
                        {/* Corner brackets */}
                        {[
                          "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                          "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                          "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                          "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                        ].map((cls, i) => (
                          <div key={i} className={cn("absolute w-8 h-8 border-amber-400", cls)} />
                        ))}

                        {/* Animated scan line */}
                        <motion.div
                          className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                          animate={{ top: ["10%", "90%", "10%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Error state */}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                    <p className="text-sm text-white text-center">{error}</p>
                    <button
                      onClick={startScanning}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </div>
                )}

                {/* Loading state */}
                {!isScanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/[0.08] space-y-3">
                {isScanning && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    Camera active — scanning for barcode...
                  </div>
                )}

                {/* Manual entry fallback */}
                <ManualBarcodeEntry onSubmit={(code) => { onScan(code); onClose(); }} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ManualBarcodeEntry({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && value.trim()) { onSubmit(value.trim()); setValue(""); } }}
        placeholder="Or type barcode manually..."
        className="flex-1 h-8 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/80 text-xs placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 transition-colors"
      />
      <button
        onClick={() => { if (value.trim()) { onSubmit(value.trim()); setValue(""); } }}
        disabled={!value.trim()}
        className="h-8 px-3 rounded-lg bg-amber-500 text-black text-xs font-medium hover:bg-amber-400 transition-colors disabled:opacity-40"
      >
        Use
      </button>
    </div>
  );
}

// Need useState for ManualBarcodeEntry
import { useState } from "react";