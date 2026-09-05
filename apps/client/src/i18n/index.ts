import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations, type Lang } from "@it-heroes/shared";

const saved = (localStorage.getItem("it-heroes:lang") as Lang) || "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: translations.es },
    en: { translation: translations.en },
  },
  lng: saved,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
