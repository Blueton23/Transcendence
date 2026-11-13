import type { SVGProps } from "react";

/* coincide avec les elements inséré une seule fois dans index.html. */
// eslint-disable-next-line react-refresh/only-export-components
export const iconNames = [
  "arrow",
  "back",
  "bell",
  "cal",
  "car",
  "cash",
  "chat",
  "check",
  "chev-down",
  "chev-right",
  "compass",
  "dots",
  "edit",
  "email",
  "google",
  "info",
  "heart-f",
  "lock",
  "logout",
  "moon",
  "pin",
  "pinplus",
  "plus",
  "route",
  "search",
  "tent",
  "trash",
  "user",
  "users",
  "van",
  "wifi-off",
  "x",
] as const;

export type IconName = (typeof iconNames)[number];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

const baseStyle = "inline-block shrink-0";

function Icon({ name, size = 20, className = "", ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={`${baseStyle} ${className}`}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
export default Icon;
