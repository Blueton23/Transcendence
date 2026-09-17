import type { InputHTMLAttributes, ReactNode } from "react";

type InputVariant = "default" | "mono";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconLabel?: string;
}

const variantStyles = {
  default: "font-sans",
  mono: "font-mono",
};

const baseStyle =
  "w-full rounded-md border border-border-control bg-surface-control px-4 py-[13px] font-semibold text-md text-text placeholder:font-medium placeholder:text-muted outline-none focus:border-brand-primary read-only:cursor-default read-only:bg-surface-soft read-only:text-muted read-only:focus:border-border-control disabled:cursor-default disabled:bg-surface-soft disabled:text-muted";

function Input({
  variant = "default",
  icon,
  onIconClick,
  iconLabel = "Action",
  className = "",
  ...rest
}: InputProps) {
  const variantStyle = variantStyles[variant];

  return (
    <div className="relative w-full">
      <input
        className={`${baseStyle} ${variantStyle} ${icon ? "pr-10" : ""} ${className}`}
        {...rest}
      />
      {icon && (
        <button
          type="button"
          aria-label={iconLabel}
          onClick={onIconClick}
          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
        >
          {icon}
        </button>
      )}
    </div>
  );
}

export default Input;
