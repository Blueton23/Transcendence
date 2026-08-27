import type { ReactNode, SelectHTMLAttributes } from "react";
import Icon from "./Icon";

type SelectVariant = "default" | "mono";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  variant?: SelectVariant;
  icon?: ReactNode;
}

const variantStyles = {
  default: "font-sans",
  mono: "font-mono",
};

const baseStyle =
  "w-full appearance-none rounded-md border border-border-control bg-surface-control py-3 pr-10 font-semibold text-sm text-text outline-none focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60 sm:py-[13px] sm:pr-12 sm:text-md";

function Select({
  children,
  variant = "default",
  icon,
  className = "",
  ...rest
}: SelectProps) {
  const variantStyle = variantStyles[variant];
  const paddingStyle = icon ? "pl-10 sm:pl-11" : "pl-3.5 sm:pl-4";

  let iconElement = null;

  if (icon) {
    iconElement = (
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 sm:left-4">
        {icon}
      </span>
    );
  }

  return (
    <div className="relative w-full">
      {iconElement}

      <select
        className={`${baseStyle} ${variantStyle} ${paddingStyle} ${className}`}
        {...rest}
      >
        {children}
      </select>

      <Icon
        name="chev-down"
        size={16}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted sm:right-4"
      />
    </div>
  );
}

export default Select;
