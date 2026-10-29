import type { ReactNode, ButtonHTMLAttributes } from "react";

type IconButtonVariant =
  "primary" | "flat" | "outline" | "ghost" | "success" | "danger";

type IconButtonSize = "xs" | "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variantStyles = {
  primary: "bg-brand-primary text-inverse border-transparent",
  flat: "bg-surface-container text-muted border-transparent",
  outline: "bg-surface border-border text-text-secondary",
  ghost: "bg-transparent border-transparent text-muted",
  success: "bg-success/15 text-success border-transparent hover:bg-success/25",
  danger: "bg-error/15 text-error border-transparent hover:bg-error/25",
};

const sizeStyles = {
  xs: "w-7 h-7 md:w-[34px] md:h-[34px]",
  sm: "w-[34px] h-[34px]",
  md: "w-9 h-9 md:w-11 md:h-11",
  lg: "w-12 h-12 md:w-12 md:h-12",
};

const baseStyle =
  "inline-flex items-center justify-center shrink-0 rounded-full border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

function IconButton({
  icon,
  label,
  variant = "outline",
  size = "sm",
  className = "",
  ...rest
}: IconButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      type="button"
      aria-label={label}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default IconButton;
