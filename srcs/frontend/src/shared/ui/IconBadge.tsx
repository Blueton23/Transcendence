import Icon from "./Icon";
import type { IconName } from "./Icon";
import { iconColor } from "@/shared/ui/iconColor";

export type IconBadgeColor = "red" | "purple" | "ink" | "brand";

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
  md: "w-[18px] h-[18px] md:w-[25px] md:h-[25px]",
};

const colorStyles = {
  red: "bg-error-bg text-error",
  purple: "bg-info-bg text-info",
  ink: "bg-surface-container text-text",
  brand: "bg-brand-primary/80 text-inverse",
};

const baseStyle = "inline-flex items-center justify-center rounded-md";

function IconBadge({
  name,
  color = iconColor[name] ?? "ink",
  size = "md",
}: IconBadgeProps) {
  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${colorStyles[color]}`}>
      <Icon name={name} className={iconSizeStyles[size]} />
    </span>
  );
}
export default IconBadge;
