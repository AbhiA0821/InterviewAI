import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "teal" | "indigo" | "amber" | "rose" | "slate";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "emerald",
  dot = false,
  className = "",
  ...props
}) => {
  const variantStyles = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    teal: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const dotColors = {
    emerald: "bg-emerald-400",
    teal: "bg-teal-300",
    indigo: "bg-indigo-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
