import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  icon?: ReactNode;
}

const stateStyles = {
  active: "bg-brand-dark text-surface-soft border-transparent",
  inactive: "bg-surface-control text-text-secondary border-border-control",
};

const baseStyle =
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 font-bold text-xs cursor-pointer disabled:cursor-default disabled:bg-surface-soft disabled:text-muted md:gap-2 md:px-[15px] md:py-2.5 md:text-sm";

function Chip({
  children,
  active = false,
  icon,
  className = "",
  ...rest
}: ChipProps) {
  let stateStyle = stateStyles.inactive;
  if (active) {
    stateStyle = stateStyles.active;
  }
  let iconElement = null;
  if (icon) {
    iconElement = icon;
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${baseStyle} ${stateStyle} ${className}`}
      {...rest}
    >
      {iconElement}
      {children}
    </button>
  );
}
export default Chip;
