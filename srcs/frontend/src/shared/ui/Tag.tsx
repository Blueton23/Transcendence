import type { ReactNode } from "react";

type TagTone =
  | "default"
  | "muted"
  | "inverse"
  | "light"
  | "lodging"
  | "todo"
  | "idea"
  | "restaurant"
  | "accommodation"
  | "activity"
  | "sightseeing";
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
  lodging: "bg-idea-lodging-bg text-idea-lodging font-sans font-semibold",
  todo: "text-error border border-dashed border-border-alert-dashed font-sans font-semibold",
  restaurant: "bg-idea-restaurant-bg text-idea-restaurant",
  accommodation: "bg-idea-lodging-bg text-idea-lodging",
  activity: "bg-idea-activity-bg text-idea-activity",
  sightseeing: "bg-idea-sightseeing-bg text-idea-sightseeing",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-1xs md:px-4 md:text-sm",
  md: "px-3.5 py-1.5 text-xs md:px-4 md:text-sm",
};

const shapeStyles = {
  pill: "rounded-full",
  soft: "rounded-sm",
};

const baseStyle =
  "inline-flex min-w-0 shrink items-center justify-center gap-2";

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
