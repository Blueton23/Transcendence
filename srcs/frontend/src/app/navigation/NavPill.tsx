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
      end
      className={({ isActive }) =>
        `${styles.base} ${isActive ? styles.active : styles.inactive}`
      }
    >
      <span className="relative">
        <Icon name={iconName} size={variant === "mobile" ? 20 : undefined} />
        {variant === "mobile" && (
          <CountBadge count={badgeCount} variant="mobile" />
        )}
      </span>
      {label}
      {variant === "desktop" && <CountBadge count={badgeCount} />}
    </NavLink>
  );
}
export default NavPill;
