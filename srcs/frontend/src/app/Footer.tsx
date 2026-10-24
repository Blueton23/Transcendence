import { LanguageSwitcher } from "@/app/navigation/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="flex flex-col items-center justify-between gap-2">
      <nav className="flex gap-4 text-xs text-muted underline">
        <Link to="/privacy">{t("legal.privacy")}</Link>
        <Link to="/terms">{t("legal.terms")}</Link>
      </nav>
      <LanguageSwitcher />
    </footer>
  );
}
