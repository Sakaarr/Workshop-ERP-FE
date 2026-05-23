"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found",
  loading,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap",
                  col.className,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div
                        className="skeleton h-4 rounded"
                        style={{
                          width: `${Math.random() * 40 + 40}%`,
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row, i) => (
                <motion.tr
                  key={keyExtractor(row)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-muted/40 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 text-foreground", col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </motion.tr>
              ))}
        </tbody>
      </table>

      {!loading && data.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}