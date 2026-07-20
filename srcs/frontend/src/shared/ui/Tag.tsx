import type { ReactNode } from "react";

interface TagProps {
	children: ReactNode;
	className?: string;
}

const baseStyle = "inline-flex items-center justify-center rounded-full border border-border bg-surface-container px-[11px] py-1 font-mono font-semibold text-xs text-text-secondary"

function Tag({ children, className = "" }: TagProps) {
	return (
		<span className={`${baseStyle} ${className}`}>
			{children}
		</span>
	);
}
export default Tag;
