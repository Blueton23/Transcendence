import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary"| "dark" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: ButtonVariant;
	icon?: ReactNode;
}

const variantStyles = {
	primary: "bg-brand-primary text-inverse",
	dark: "bg-brand-dark text-inverse",
	outline: "bg-surface border border-border text-text",
};

const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold text-sm"

function Button({ children, variant = "outline", icon, className="", ...rest}: ButtonProps) {
	const variantStyle = variantStyles[variant];
	let iconElement = null;
	if (icon){
		iconElement = icon;
	}
	return (
		<button className={`${baseStyle} ${variantStyle} ${className}`}
		{...rest}
		>
			{iconElement}
			{children}
		</button>
	);
}
export default Button;