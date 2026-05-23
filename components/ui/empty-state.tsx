import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}