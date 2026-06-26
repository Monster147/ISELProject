const i18n = {
  t: (key) => key,
  language: "en",
  changeLanguage: () => Promise.resolve(),
};

module.exports = {
  __esModule: true,
  useTranslation: () => ({ t: (key) => key, i18n }),
  initReactI18next: { type: "3rdParty", init: () => {} },
  Trans: ({ children }) => children,
};
