import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "danger" | "ghost";

type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantStyles = {
  primary: "bg-brand-primary text-inverse",
  dark: "bg-brand-dark text-inverse",
  outline: "bg-surface border border-border text-text",
  danger: "bg-error text-inverse border-transparent",
  ghost: "bg-transparent text-text",
};

const sizeStyles = {
  sm: "text-xs px-3 py-2 md:px-5 md:py-3 md:text-sm",
  md: "px-5 py-3 text-sm",
};

const baseStyle =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide";

function Button({
  children,
  variant = "outline",
  size = "md",
  icon,
  className = "",
  ...rest
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  let iconElement = null;
  if (icon) {
    iconElement = icon;
  }
  return (
    <button
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      {...rest}
    >
      {iconElement}
      {children}
    </button>
  );
}
export default Button;
