import type { ReactNode } from "react";

type TagTone =
  "default" | "muted" | "inverse" | "light" | "lodging" | "todo" | "idea";
type TagSize = "sm" | "md";

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  size?: TagSize;
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
  lodging: "bg-idea-lodging-bg text-idea-lodging font-sans font-semibold",
  todo: "text-error border border-dashed border-border-alert-dashed font-sans font-semibold",
};

const sizeStyles = {
  sm: "px-2 py-1.5 text-1xs md:px-4 md:text-sm", // taille actuelle
  md: "px-3 py-1.5 text-xs md:px-4 md:text-sm", // plus lisible sur mobile
};

const baseStyle =
  "inline-flex min-w-0 shrink items-center justify-center rounded-full gap-2";

function Tag({
  children,
  tone = "default",
  size = "sm",
  icon,
  className = "",
}: TagProps) {
  const tagTone = toneStyles[tone];
  return (
    <span
      className={`${baseStyle} ${tagTone} ${sizeStyles[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
export default Tag;
