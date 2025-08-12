module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    localeDetection: true,
  },
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
} 