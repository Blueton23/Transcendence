import type { SVGProps } from "react";

/* coincide avec les elements inséré une seule fois dans index.html. */
export const iconNames = [
	"arrow", "back", "bed", "bell", "cal", "car", "cash", "chat",
	"check", "chev-down", "city", "coffee", "compass", "dots", "ext",
	"fork", "heart", "heart-f", "home", "inbox", "info", "map",
	"moon", "moon-off", "mtn", "photo", "pin", "pinplus", "plus",
	"route", "search", "spark", "spark-f", "store", "sun", "tent",
	"user", "users", "van", "wallet", "wifi-off",
] as const;

export type IconName = typeof iconNames[number];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
	name: IconName;
	size?: number;
}

const baseStyle = "inline-block shrink-0"

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
