import type { ReactNode } from "react";

interface NavFrameProps {
  children: ReactNode;
}

export function NavFrame({ children }: NavFrameProps) {
  return <div className="flex flex-1 bg-background">{children}</div>;
}

export default NavFrame;
