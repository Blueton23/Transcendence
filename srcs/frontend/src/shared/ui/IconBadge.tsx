import Icon from "./Icon";
import type { IconName } from "./Icon";

export type IconBadgeColor =
  "green" | "red" | "purple" | "amber" | "ink" | "brand" | "chosen";

type IconBadgeSize = "sm" | "md";

interface IconBadgeProps {
  size?: IconBadgeSize;
  color?: IconBadgeColor;
  name: IconName;
}

const sizeStyles = {
  sm: "w-[34px] h-[34px]",
  md: "w-[44px] h-[44px]",
};

const colorStyles = {
  green: "bg-success-bg text-success-text",
  red: "bg-error-bg text-error",
  amber: "bg-warning/50 text-warning-text",
  purple: "bg-info-bg text-info",
  ink: "bg-surface-container text-text",
  brand: "bg-brand-primary/80 text-inverse",
  chosen: "g-surface-control text-success-text",
};

const baseStyle = "inline-flex items-center justify-center rounded-md";

function IconBadge({ name, color = "purple", size = "md" }: IconBadgeProps) {
  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${colorStyles[color]}`}>
      <Icon name={name} size={25} />
    </span>
  );
}
export default IconBadge;
