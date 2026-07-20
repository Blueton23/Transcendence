import type { ReactNode } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg";
type AvatarColor = "1" | "2" | "3" | "4";

interface AvatarProps {
  children: ReactNode;
  size?: AvatarSize;
  color?: AvatarColor;
  className?: string;
}

const sizeStyles = {
  xs: "w-4 h-4 text-2xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-9 h-9 text-md",
};

const colorStyles = {
  "1": "bg-brand-dark text-inverse",
  "2": "bg-brand-primary-strong text-inverse",
  "3": "bg-warning text-text",
  "4": "bg-info text-inverse",
};

const baseStyle = "inline-flex items-center justify-center rounded-full font-bold";

function Avatar({ children, size = "md", color = "1", className = "" }: AvatarProps) {
  const avatarSize = sizeStyles[size];
  const avatarColor = colorStyles[color];

  return (
    <span className={`${baseStyle} ${avatarSize} ${avatarColor} ${className}`}>
      {children}
    </span>
  );
}
export default Avatar;