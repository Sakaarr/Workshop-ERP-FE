"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, pageSize, onPageChange }: PaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> records
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let p: number;
          if (pages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= pages - 2) p = pages - 4 + i;
          else p = page - 2 + i;

          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                p === page
                  ? "bg-foreground text-background"
                  : "border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}