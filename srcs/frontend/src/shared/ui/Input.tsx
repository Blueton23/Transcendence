import type { InputHTMLAttributes } from "react";

type InputVariant = "default" | "mono";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
}

const variantStyles = {
  default: "font-sans",
  mono: "font-mono",
};

const baseStyle =
  "w-full rounded-md border border-border-control bg-surface-control px-4 py-[13px] font-semibold text-md text-text placeholder:font-medium placeholder:text-muted outline-none focus:border-brand-primary read-only:cursor-default read-only:bg-surface-soft read-only:text-muted read-only:focus:border-border-control disabled:cursor-default disabled:bg-surface-soft disabled:text-muted";

function Input({ variant = "default", className = "", ...rest }: InputProps) {
  const variantStyle = variantStyles[variant];

  return (
    <input className={`${baseStyle} ${variantStyle} ${className}`} {...rest} />
  );
}
export default Input;
