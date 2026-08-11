import type { ReactNode } from "react";

type HeadingSize = "sm" | "md" | "lg";

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  size?: HeadingSize;
  className?: string;
}

const sizeStyles = {
  sm: "text-base md:text-lg",   // 18px sous-titre
  md: "text-lg md:text-xl",   // 22px titre de carte/modale
  lg: "text-xl md:text-2xl",  // 32px titre de page
};

const baseStyle = "font-extrabold text-text tracking-tight";

function Heading({ children, level = 2, size = "md", className = "" }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  const headingSize = sizeStyles[size];

  return (
    <Tag className={`${baseStyle} ${headingSize} ${className}`}>
      {children}
    </Tag>
  );
}
export default Heading;