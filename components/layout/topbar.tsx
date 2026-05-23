"use client";

import { Bell, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {cn} from "@/lib/utils";

interface TopbarProps {
  title?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-5 gap-4 shrink-0 sticky top-0 z-10">
      {title && (
        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
      )}

      <div className="flex-1">{children}</div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={cycleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "light" && (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Sun className="w-4 h-4" />
                </motion.div>
              )}
              {theme === "dark" && (
                <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
              {theme === "system" && (
                <motion.div key="monitor" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Monitor className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </header>
  );
}