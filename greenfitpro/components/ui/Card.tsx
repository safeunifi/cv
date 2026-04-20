import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
}

export function Card({ children, className = "", variant = "default", style, ...props }: CardProps) {
  const base: React.CSSProperties = {
    background: variant === "elevated" ? "var(--surface2)" : "var(--surface)",
    border: `1px solid ${variant === "outline" ? "var(--primary-dim)" : "var(--border)"}`,
    borderRadius: 16,
    ...style,
  };
  return (
    <div className={`overflow-hidden ${className}`} style={base} {...props}>
      {children}
    </div>
  );
}
