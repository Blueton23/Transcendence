import type { ReactNode } from "react";

type TextTone = "primary" | "secondary" | "muted" | "success" | "accent";
type TextSize = "sm" | "md";
type TextFont = "sans" | "mono";

interface TextProps {
  children: ReactNode;
  tone?: TextTone;
  size?: TextSize;
  font?: TextFont;
  className?: string;
}

const toneStyles = {
  primary: "text-text",
  secondary: "text-text-secondary",
  muted: "text-muted",
  success: "text-success-text",
  accent: "text-error",
};

const sizeStyles = {
  sm: "text-xs",
  md: "text-md",
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
  className = "",
}: TextProps) {
  const textTone = toneStyles[tone];

  return (
    <p
      className={`${textTone} ${sizeStyles[size]} ${fontStyles[font]} ${className}`}
    >
      {children}
    </p>
  );
}
export default Text;
