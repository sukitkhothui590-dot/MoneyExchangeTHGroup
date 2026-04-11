import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  /** Extra Tailwind classes on the outer card (merged with defaults). */
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
  className = "",
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-success"
      : changeType === "negative"
        ? "text-danger"
        : "text-muted";

  return (
    <div
      className={`group bg-white/95 border border-border/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm admin-card-lift ${className}`.trim()}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-subtle to-white text-brand flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-brand/10 group-hover:ring-brand/20 transition-[box-shadow] duration-200">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted/90 leading-tight">
          {label}
        </p>
        <p className="text-xl font-semibold text-foreground mt-1 leading-tight tabular-nums">
          {value}
        </p>
        {change && (
          <p className={`text-[11px] mt-1 ${changeColor}`}>{change}</p>
        )}
      </div>
    </div>
  );
}
