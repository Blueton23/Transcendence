import { useTranslation } from "react-i18next";
import Chip from "@/shared/ui/Chip";

const languages = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex gap-1" role="group" aria-label={t("actions.language")}>
      {languages.map(({ code, label }) => (
        <Chip
          key={code}
          active={i18n.resolvedLanguage === code}
          onClick={() => i18n.changeLanguage(code)}
          className="px-3! py-1.5!"
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}