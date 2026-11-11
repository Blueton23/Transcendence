import type { ReactNode } from "react";

type CardVariant =
  "default" | "accent" | "success" | "alert" | "dashed" | "dashed-accent";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  band?: ReactNode;
  bandClassName?: string;
}

const variantStyles = {
  default: "bg-surface border-transparent shadow-sm text-text",
  accent: "bg-surface border-brand-primary/35 shadow-sm text-text",
  success: "bg-success-bg border-border-success text-success-text",
  alert: "bg-error-bg border-transparent text-error",
  dashed:
    "bg-surface-soft border-dashed border-[1.5px] border-border-collection text-text",
  "dashed-accent":
    "bg-alert-dashed-bg border-dashed border-[1.5px] border-border-alert-dashed text-error",
};

const baseStyle = "border bg-clip-padding rounded-md p-3 md:py-2";
const interactiveStyle =
  "transition-all hover:border-brand-primary/25 hover:-translate-y-px cursor-pointer";

function Card({
  children,
  variant = "default",
  interactive = false,
  className = "",
  onClick,
  band,
  bandClassName = "bg-surface-container",
}: CardProps) {
  const cardStyle = variantStyles[variant];
  const hoverStyle = interactive ? interactiveStyle : "";

  if (band) {
    return (
      <div
        className={`rounded-md border bg-clip-padding ${cardStyle} ${hoverStyle}`}
        onClick={onClick}
      >
        <div
          className={`flex items-center gap-2 rounded-t-[calc(var(--radius-md)-1px)] px-4 py-2 ${bandClassName}`}
        >
          {band}
        </div>
        <div className={`px-4 py-3 ${className}`}>{children}</div>
      </div>
    );
  }
  return (
    <div
      className={`${baseStyle} ${cardStyle} ${hoverStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
export default Card;
