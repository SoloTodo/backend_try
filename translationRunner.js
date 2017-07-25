// translationRunner.js
const manageTranslations = require('react-intl-translations-manager').default;

manageTranslations({
  messagesDirectory: 'src/translations/',
  translationsDirectory: 'src/translations/locales/',
  languages: ['en', 'es']
});
