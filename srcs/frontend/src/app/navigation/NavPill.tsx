import { pillBase, pillStateStyles } from "./pillStyles";
import { NavLink } from "react-router";
import type { IconName } from "../../shared/ui/Icon";
import Icon from "../../shared/ui/Icon";
import { navPillMobileBase, navPillMobileStateStyles } from "./pillStyles";
import CountBadge from "./CountBadge";

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
      <CountBadge count={badgeCount} variant="mobile" />
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
      <CountBadge count={badgeCount} />
    </NavLink>
  );
}
export default NavPill;
