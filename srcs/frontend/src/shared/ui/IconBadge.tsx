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
  md: "md:w-[44px] md:h-[44px] w-[36px] h-[36px]",
};

const iconSizeStyles = {
  sm: "w-[18px] h-[18px]",
  md: "w-[18px] h-[18px] md:w-[22px] md:h-[22px]",
};

const colorStyles = {
  green: "bg-success-bg text-success-text",
  red: "bg-error-bg text-error",
  amber: "bg-warning/50 text-warning-text",
  purple: "bg-info-bg text-info",
  ink: "bg-surface-container text-text",
  brand: "bg-brand-primary/80 text-inverse",
  chosen: "bg-surface-control text-success-text",
};

const baseStyle = "inline-flex items-center justify-center rounded-md";

function IconBadge({ name, color = "purple", size = "md" }: IconBadgeProps) {
  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${colorStyles[color]}`}>
      <Icon name={name} className={iconSizeStyles[size]} />
    </span>
  );
}
export default IconBadge;
