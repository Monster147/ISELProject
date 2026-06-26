const i18n = {
  t: (key) => key,
  use: () => i18n,
  init: () => Promise.resolve(),
  changeLanguage: () => Promise.resolve(),
  language: "en",
};

module.exports = {
  __esModule: true,
  default: i18n,
};
