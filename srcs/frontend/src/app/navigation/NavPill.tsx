import { NavLink } from "react-router";
import type { IconName } from "../../shared/ui/Icon";
import Icon from "../../shared/ui/Icon";
import CountBadge from "./CountBadge";
import { pillStyles } from "@/app/navigation/pillStyles";

interface NavPillProps {
  to: string;
  iconName: IconName;
  label: string;
  badgeCount?: number;
  variant?: "desktop" | "mobile";
}

export function NavPill({
  to,
  iconName,
  label,
  badgeCount,
  variant = "desktop",
}: NavPillProps) {
  const styles = pillStyles[variant];
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.base} ${isActive ? styles.active : styles.inactive}`
      }
    >
      <Icon name={iconName} size={variant === "mobile" ? 20 : undefined} />
      {label}
      <CountBadge count={badgeCount} variant={variant} />
    </NavLink>
  );
}
export default NavPill;
