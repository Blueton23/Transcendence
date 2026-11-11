import type { ReactNode } from "react";

type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl";

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  size?: HeadingSize;
  className?: string;
}

const sizeStyles = {
  xs: "text-xs md:text-sm",
  sm: "text-base md:text-lg",
  md: "text-lg md:text-xl",
  lg: "text-xl md:text-2xl",
  xl: "text-2xl md:text-3xl",
};

const baseStyle = "font-extrabold text-text";

function Heading({
  children,
  level = 2,
  size = "md",
  className = "",
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  const headingSize = sizeStyles[size];

  return (
    <Tag className={`${baseStyle} ${headingSize} ${className}`}>{children}</Tag>
  );
}
export default Heading;
