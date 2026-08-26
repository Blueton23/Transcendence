import type { ReactNode } from "react";

interface NavFrameProps {
  children: ReactNode;
}

export function NavFrameDesktop({ children }: NavFrameProps) {
  return (
    <div className="hidden md:flex md:w-62.5 md:flex-col md:bg-surface-soft md:p-6">
      {children}
    </div>
  );
}

export function NavFrameMobile({ children }: NavFrameProps) {
  return (
    <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-brand-dark p-2 md:hidden">
      {children}
    </div>
  );
}
