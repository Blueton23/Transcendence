import { AccountCard } from "@/app/navigation/AccountCard";
import { LanguageSwitcher } from "@/app/navigation/LanguageSwitcher";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

interface NavFrameProps {
  children: ReactNode;
}

export function NavFrameDesktop({ children }: NavFrameProps) {
  const { t } = useTranslation();
  return (
    <div className="hidden md:flex md:w-68 md:flex-col md:gap-6 md:border-r md:border-border md:bg-surface-container md:p-6">
      {children}
      <div className="mt-auto flex flex-col gap-4">
        <LanguageSwitcher />
        <AccountCard />
        <nav className="flex justify-between text-xs text-muted underline">
          <Link to="/privacy">{t("legal.privacy")}</Link>
          <Link to="/terms">{t("legal.terms")}</Link>
        </nav>
      </div>
    </div>
  );
}

export function NavFrameMobile({
  children,
  wide = false,
}: NavFrameProps & { wide?: boolean }) {
  const position = wide ? "inset-x-3" : "inset-x-1/4";
  return (
    <div
      className={`fixed bottom-4 z-30 flex rounded-full bg-brand-dark p-1.5 md:hidden ${position}`}
    >
      {children}
    </div>
  );
}
