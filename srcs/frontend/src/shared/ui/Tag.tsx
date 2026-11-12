import type { ReactNode } from "react";

type TagTone =
  "default" | "muted" | "inverse" | "light" | "todo" | "idea" | "plain";
type TagSize = "sm" | "md";
type TagShape = "pill" | "soft";

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  size?: TagSize;
  shape?: TagShape;
  icon?: ReactNode;
  className?: string;
}

const toneStyles = {
  default:
    "bg-surface-container text-text-secondary border border-border font-mono",
  muted: "bg-surface-container text-muted font-mono",
  inverse: "bg-white/12 text-inverse border border-white/16 font-mono",
  light: "bg-surface-control text-text font-mono",
  idea: "bg-surface-container text-text-secondary border border-border font-sans font-semibold",
  todo: "text-error border border-dashed border-border-alert-dashed font-sans font-semibold",
  plain: "font-sans font-semibold",
};

const sizeStyles = {
  sm: "h-6 px-2.5 text-xs",
  md: "h-7 px-3 text-xs md:text-sm",
};

const shapeStyles = {
  pill: "rounded-full",
  soft: "rounded-sm",
};

const baseStyle =
  "inline-flex min-w-0 shrink items-center justify-center gap-1.5 whitespace-nowrap";

function Tag({
  children,
  tone = "default",
  size = "sm",
  shape = "pill",
  icon,
  className = "",
}: TagProps) {
  const tagTone = toneStyles[tone];
  return (
    <span
      className={`${baseStyle} ${tagTone} ${sizeStyles[size]} ${shapeStyles[shape]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
export default Tag;
