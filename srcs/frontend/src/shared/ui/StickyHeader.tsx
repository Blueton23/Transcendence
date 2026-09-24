import type { ReactNode } from "react";

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

export function StickyHeader({ children, className = "" }: StickyHeaderProps) {
  return (
    <div
      className={`sticky top-0 z-10 flex flex-col bg-background pt-4 ${className}`}
    >
      {children}
    </div>
  );
}
