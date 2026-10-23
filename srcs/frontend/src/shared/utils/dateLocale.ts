import i18n from "@/i18n";

const dateLocales = { fr: "fr-CH", en: "en-GB", es: "es-ES" } as const;

export function getDateLocale(): string {
  return (
    dateLocales[i18n.resolvedLanguage as keyof typeof dateLocales] ?? "fr-CH"
  );
}
