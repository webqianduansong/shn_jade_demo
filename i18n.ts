import {locales} from './src/i18n/request';

const config = {
  locales: locales as unknown as string[],
  defaultLocale: 'en',
  localePrefix: 'as-needed' as const
};

export default config;


