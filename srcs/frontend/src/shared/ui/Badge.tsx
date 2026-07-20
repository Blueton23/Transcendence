import type { ReactNode } from "react";

type BadgeVariant = "success"| "warning" | "error";

interface BadgeProps {
	children: ReactNode;
	variant: BadgeVariant;
	icon?: ReactNode;
	className?: string;
}

const variantStyles = {
	success: "bg-success-bg text-success-text",
	warning: "bg-warning-bg text-warning-text",
	error: "bg-error-bg text-error",
};

const baseStyle = "inline-flex items-center justify-center rounded-full px-2.5 py-1 font-bold text-xs"

function Badge({ children, variant, icon, className=""}: BadgeProps) {
	const variantStyle = variantStyles[variant];
	let iconElement = null;
	if (icon){
		iconElement = icon;
	}
	return (
		<span className={`${baseStyle} ${variantStyle} ${className}`}>
			{iconElement}
			{children}
		</span>
	);
}
export default Badge;