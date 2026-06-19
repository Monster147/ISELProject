import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import en from "@commons/i18next/locales/en";
import pt from "@commons/i18next/locales/pt";
import es from "@commons/i18next/locales/es";

const lng = navigator.language?.split("-")[0] ?? "en"; // "pt" de "pt-PT"
console.log("detected language:", lng);
console.log(navigator.language?.split("-")[0]);

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en,
      pt,
      es,
    },
    lng, // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    supportedLngs: ["en", "pt", "es"],

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

export default i18n;
