import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className = "",
  style,
  disabled,
  ...props
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--primary)", color: "#000", fontWeight: 700 },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    danger: { background: "var(--danger)", color: "#fff", fontWeight: 700 },
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-3 text-base rounded-xl",
    lg: "px-6 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      className={`flex items-center justify-center gap-2 transition-all active:scale-95 ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        ...styles[variant],
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: "currentColor", borderTopColor: "transparent" }}
        />
      )}
      {children}
    </button>
  );
}
