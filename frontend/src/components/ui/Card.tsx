import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "glass-hover" | "solid" | "gradient";
  glow?: "emerald" | "teal" | "cyan" | "none";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "glass",
  glow = "none",
  className = "",
  ...props
}) => {
  const variantStyles = {
    glass: "glass-panel rounded-2xl p-6",
    "glass-hover": "glass-card glass-card-hover rounded-2xl p-6",
    solid: "bg-slate-900/90 border border-slate-800 rounded-2xl p-6",
    gradient: "bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 rounded-2xl p-6",
  };

  const glowStyles = {
    emerald: "glow-emerald",
    teal: "glow-teal",
    cyan: "glow-cyan",
    none: "",
  };

  return (
    <div
      className={`${variantStyles[variant]} ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mb-4 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-bold text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-xs text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export default Card;
