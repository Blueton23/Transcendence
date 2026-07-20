import type { ReactNode } from "react";

type CardVariant = "default" | "accent" | "success" | "alert" | "dashed" | "dashed-accent";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantStyles = {
  default: "bg-surface border-border shadow-sm text-text",
  accent: "bg-surface border-brand-primary/35 shadow-sm text-text",
  success: "bg-success-bg border-border-success text-success-text",
  alert: "bg-error-bg border-transparent text-error",
  dashed: "bg-surface-soft border-dashed border-[1.5px] border-border-collection text-text",
  "dashed-accent": "bg-alert-dashed-bg border-dashed border-[1.5px] border-border-alert-dashed text-error",
};

const baseStyle = "border rounded-md p-4";

function Card({ children, variant = "default", className = "" }: CardProps) {
  const cardStyle = variantStyles[variant];

  return (
    <div className={`${baseStyle} ${cardStyle} ${className}`}>
      {children}
    </div>
  );
}
export default Card;