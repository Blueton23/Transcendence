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
    <div className="hidden md:flex md:w-62.5 md:flex-col md:p-6">
      {children}
      <div className="mt-auto flex flex-col gap-4">
        <LanguageSwitcher />
        <nav className="flex flex-col gap-1 text-xs text-muted underline">
          <Link to="/privacy">{t("legal.privacy")}</Link>
          <Link to="/terms">{t("legal.terms")}</Link>
        </nav>
      </div>
    </div>
  );
}

export function NavFrameMobile({ children }: NavFrameProps) {
  return (
    <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full bg-brand-dark p-2 md:hidden">
      {children}
    </div>
  );
}
