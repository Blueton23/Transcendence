import type { ReactNode } from "react";

type TagTone = "default"| "muted"| "inverse";

interface TagProps {
	children: ReactNode;
	tone?: TagTone;
	className?: string;
}

const toneStyles = {
	default: "bg-surface-container text-text-secondary border border-border",
	muted: "bg-surface-container text-muted",
	inverse: "bg-white/12 text-inverse border border-white/16"
}

const baseStyle = "inline-flex items-center justify-center rounded-full  px-[11px] py-1 font-mono font-semibold text-xs"

function Tag({ children, tone = "default", className = "" }: TagProps) {
	const tagTone = toneStyles[tone];
	return (
		<span className={`${baseStyle} ${tagTone} ${className}`}>
			{children}
		</span>
	);
}
export default Tag;
