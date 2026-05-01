import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'pa'];

export default getRequestConfig(async (params) => {
  let locale = params.locale;
  if (!locale && params.requestLocale) {
    locale = await params.requestLocale;
  }
  
  console.log('[i18n] Received locale:', locale);
  const safeLocale = locales.includes(locale) ? locale : 'en';
  
  const enMessages = (await import(`./messages/en.json`)).default;
  
  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], deepMerge(target[key], source[key]));
      }
    }
    return { ...target, ...source };
  }

  let messages = enMessages;
  
  if (safeLocale !== 'en') {
    try {
      const targetMessages = (await import(`./messages/${safeLocale}.json`)).default;
      messages = deepMerge(enMessages, targetMessages);
    } catch (e) {
      console.error('Missing locale file:', safeLocale);
    }
  }

  return {
    locale: safeLocale,
    messages
  };
});
