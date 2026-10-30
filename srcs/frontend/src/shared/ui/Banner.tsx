import type { ReactNode } from "react";

type BannerVariant = "success" | "warning" | "error";

interface BannerProps {
  children: ReactNode;
  className?: string;
  variant: BannerVariant;
  icon?: ReactNode;
}

const variantStyles = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  error: "bg-error-bg text-error",
};

const baseStyle =
  "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold";

function Banner({ children, variant, icon, className = "" }: BannerProps) {
  return (
    <div
      role="status"
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      {icon}
      {children}
    </div>
  );
}

export default Banner;
