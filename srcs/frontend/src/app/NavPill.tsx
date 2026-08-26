import Badge from "../shared/ui/Badge";
import { pillBase, pillStateStyles } from "./pillStyles";
import { NavLink } from "react-router";
import type { ReactNode } from "react";


interface NavPillProps {
  to: string;
  icon: ReactNode;
  label: string;
  badgeCount?: number;
}

const pillActive = pillStateStyles.active;
const pillInactive = pillStateStyles.inactive;

export function NavPill({to, icon, label, badgeCount} : NavPillProps){
  return (
    <NavLink to={to} className={({isActive }) => `${pillBase} ${isActive ? pillActive : pillInactive}`}>
      {icon}
      {label}
      {badgeCount != null && badgeCount > 0 && (
        <Badge variant="warning">{badgeCount}</Badge>
      )}
    </NavLink>
  );
}
export default NavPill;
