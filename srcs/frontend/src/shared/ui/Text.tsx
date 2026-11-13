import type { ReactNode } from "react";

type TextTone = "primary" | "secondary" | "muted" | "success" | "accent";
type TextSize = "sm" | "md" | "lg" | "xl";
type TextFont = "sans" | "mono";

interface TextProps {
  children: ReactNode;
  tone?: TextTone;
  size?: TextSize;
  font?: TextFont;
  as?: "p" | "span";
  className?: string;
}

const toneStyles = {
  primary: "text-text",
  secondary: "text-text-secondary",
  muted: "text-muted",
  success: "text-success-text",
  accent: "text-error",
};

// sm: secondary info (author, step, percentage) · md: body text
// lg: amounts in cards and rows · xl: key figure (trip total)
const sizeStyles = {
  sm: "text-xs md:text-sm",
  md: "text-xs md:text-md",
  lg: "text-md md:text-base",
  xl: "text-lg md:text-xl",
};

const fontStyles = {
  sans: "font-sans",
  mono: "font-mono",
};

function Text({
  children,
  tone = "primary",
  size = "md",
  font = "sans",
  as = "p",
  className = "",
}: TextProps) {
  const textTone = toneStyles[tone];
  const Tag = as;

  return (
    <Tag
      className={`${textTone} ${sizeStyles[size]} ${fontStyles[font]} ${className}`}
    >
      {children}
    </Tag>
  );
}
export default Text;
