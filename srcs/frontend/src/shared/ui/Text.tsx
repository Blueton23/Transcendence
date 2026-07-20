import type { ReactNode } from "react";

type TextTone = "primary" | "secondary" | "muted";

interface TextProps {
  children: ReactNode;
  tone?: TextTone;
  className?: string;
}

const toneStyles = {
  primary: "text-text",
  secondary: "text-text-secondary",
  muted: "text-muted",
};

const baseStyle = "text-md";

function Text({ children, tone = "primary", className = "" }: TextProps) {
  const textTone = toneStyles[tone];

  return (
    <p className={`${baseStyle} ${textTone} ${className}`}>
      {children}
    </p>
  );
}
export default Text;