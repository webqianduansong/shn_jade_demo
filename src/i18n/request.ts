import {getRequestConfig} from 'next-intl/server';
export const locales = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ar'] as const;
export type AppLocale = typeof locales[number];

export default getRequestConfig(async ({locale}) => {
  const current = (locale && (locales as readonly string[]).includes(locale)) ? locale : 'en';
  return {
    locale: current,
    messages: (await import(`../locales/${current}.json`)).default
  };
});


