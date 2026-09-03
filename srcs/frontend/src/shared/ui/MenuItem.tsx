import type { ReactNode } from "react";
import type { IconName } from "./Icon";
import Icon from "./Icon";

interface MenuItemProps {
  icon: IconName;
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "danger";
}

const toneStyles = {
  default: "text-text font-semibold hover:bg-surface-container rounded-sm",
  danger: "text-error font-semibold hover:bg-error-bg rounded-sm",
};

const baseStyle = "flex whitespace-nowrap items-center gap-2 py-2 px-4 text-sm";

function MenuItem({
  icon,
  children,
  onClick,
  tone = "default",
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyle} ${toneStyles[tone]}`}
    >
      <Icon name={icon} size={16} />
      {children}
    </button>
  );
}
export default MenuItem;
