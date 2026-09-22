import type { ReactNode } from "react";

type TagTone = "default" | "muted" | "inverse";

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  icon?: ReactNode;
  className?: string;
}

const toneStyles = {
  default: "bg-surface-container text-text-secondary border border-border",
  muted: "bg-surface-container text-muted",
  inverse: "bg-white/12 text-inverse border border-white/16",
};

const baseStyle =
  "inline-flex min-w-0 shrink items-center justify-center rounded-full gap-2 px-2 md:px-4 py-1.5 font-mono text-1xs md:text-sm";

function Tag({ children, tone = "default", icon, className = "" }: TagProps) {
  const tagTone = toneStyles[tone];
  return (
    <span className={`${baseStyle} ${tagTone} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
export default Tag;
