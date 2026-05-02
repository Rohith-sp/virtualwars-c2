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
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
    let result = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            result[key] = source[key];
          } else {
            result[key] = deepMerge(target[key], source[key]);
          }
        } else {
          result[key] = source[key];
        }
      });
    } else {
      return source;
    }
    return result;
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
