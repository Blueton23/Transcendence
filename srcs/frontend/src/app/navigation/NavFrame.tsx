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
    <div className="relative z-30 order-last flex shrink-0 justify-center pt-2 pb-5 md:hidden">
      <div className="flex items-center rounded-full bg-brand-dark p-2">
        {children}
      </div>
    </div>
  );
}
