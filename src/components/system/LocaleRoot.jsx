import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../hooks/useLocale';

const LocaleRoot = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lng = i18n.resolvedLanguage || i18n.language || 'en';
    const rtl = isRTL(lng);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    }
  }, [i18n, i18n.language, i18n.resolvedLanguage]);

  return children;
};

export default LocaleRoot;

