import Badge from "../shared/ui/Badge";
import { pillBase, pillStateStyles } from "./pillStyles";
import { NavLink } from "react-router";
import type { IconName } from "../shared/ui/Icon";
import Icon from "../shared/ui/Icon";
import { navPillMobileBase, navPillMobileStateStyles } from "./pillStyles";

interface NavPillMobileProps {
  to: string;
  iconName: IconName;
  badgeCount?: number;
}

const mobilePillActive = navPillMobileStateStyles.active;
const mobilePillInactive = navPillMobileStateStyles.inactive;

export function NavPillMobile({
  to,
  iconName,
  badgeCount,
}: NavPillMobileProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${navPillMobileBase} ${isActive ? mobilePillActive : mobilePillInactive}`
      }
    >
      <Icon name={iconName} size={23} />
      {badgeCount != null && badgeCount > 0 && (
        <span className="absolute top-1 right-1.25 flex h-3.75 w-3.75 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-inverse">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}

interface NavPillProps {
  to: string;
  iconName: IconName;
  label: string;
  badgeCount?: number;
}

const pillActive = pillStateStyles.active;
const pillInactive = pillStateStyles.inactive;

export function NavPill({ to, iconName, label, badgeCount }: NavPillProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${pillBase} ${isActive ? pillActive : pillInactive}`
      }
    >
      <Icon name={iconName} />
      {label}
      {badgeCount != null && badgeCount > 0 && (
        <Badge variant="warning">{badgeCount}</Badge>
      )}
    </NavLink>
  );
}
export default NavPill;
