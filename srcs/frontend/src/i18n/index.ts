import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import frCommon from "./locales/fr/common.json";
import enCommon from "./locales/en/common.json";
import esCommon from "./locales/es/common.json";

const supportedLanguages = ["fr", "en", "es"];

function getSavedOrDefaultLanguage(): string {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && supportedLanguages.includes(saved)) return saved;
  } catch {
    // localStorage is inacessible we skip
  }
  const browser = navigator.language.slice(0, 2);
  return supportedLanguages.includes(browser) ? browser : "fr";
}

const savedOrDefaultLanguage = getSavedOrDefaultLanguage();

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: frCommon },
    en: { common: enCommon },
    es: { common: esCommon },
  },
  lng: savedOrDefaultLanguage,
  fallbackLng: "fr",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = savedOrDefaultLanguage;

i18n.on("languageChanged", (language) => {
  try {
    localStorage.setItem("lang", language);
  } catch {
    // ignore: language will not be memorized
  }
});

export default i18n;
