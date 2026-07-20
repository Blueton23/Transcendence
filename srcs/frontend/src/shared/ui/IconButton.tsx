import type { ReactNode, ButtonHTMLAttributes } from "react";

type IconButtonVariant = "primary" | "dark" | "outline";
type IconButtonSize = "sm" | "md";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
	label: string;
	variant?: IconButtonVariant;
	size?: IconButtonSize;
}

const variantStyles = {
	primary: "bg-brand-primary text-inverse border-transparent",
	dark: "bg-brand-dark text-surface-soft border-transparent",
	outline: "bg-surface border-border text-text",
};

const sizeStyles = {
	sm: "w-[34px] h-[34px]",
	md: "w-11 h-11",
};

const baseStyle = "inline-flex items-center justify-center shrink-0 rounded-full border cursor-pointer"

function IconButton({ icon, label, variant = "outline", size = "sm", className = "", ...rest }: IconButtonProps) {
	const variantStyle = variantStyles[variant];
	const sizeStyle = sizeStyles[size];

	return (
		<button
			type="button"
			aria-label={label}
			className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
			{...rest}
		>
			{icon}
		</button>
	);
}
export default IconButton;
