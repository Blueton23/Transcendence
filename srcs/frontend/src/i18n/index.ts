import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import frCommon from "./locales/fr/common.json";
import enCommon from "./locales/en/common.json";
import esCommon from "./locales/es/common.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: frCommon },
    en: { common: enCommon },
    es: { common: esCommon },
  },
  lng: localStorage.getItem("lang") ?? "fr",
  fallbackLng: "fr",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
