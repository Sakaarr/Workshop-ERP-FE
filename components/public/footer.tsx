import { Wrench } from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-white/60 text-sm font-medium">Auto Garden Pvt. Ltd.</span>
        </div>
        <p className="text-white/20 text-xs text-center">
          © {new Date().getFullYear()} Auto Garden Pvt. Ltd. · Bharatpur, Chitwan, Nepal
        </p>
        <Link href="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">
          Staff Portal →
        </Link>
      </div>
    </footer>
  );
}