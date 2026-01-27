import i18n, { STORAGE_KEY } from '../i18n/i18n';

const RTL_LANGS = new Set(['ar']);

export const getLocale = () =>
  i18n.resolvedLanguage || i18n.language || 'en';

export const isRTL = (lng = getLocale()) =>
  RTL_LANGS.has(lng);

export const setLocale = async (lng) => {
  const next = ['en', 'ar'].includes(lng) ? lng : 'en';
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage errors
  }
  await i18n.changeLanguage(next);
};

