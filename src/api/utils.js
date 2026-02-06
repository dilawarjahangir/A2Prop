/**
 * Build a querystring from an object, omitting undefined/null/empty values.
 * Arrays are joined with commas to match backend CSV parsing.
 */
export const buildQuery = (params = {}) => {
  const search = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        if (!value.length) return [];
        return [[key, value.join(',')]];
      }
      return [[key, value]];
    });

  if (!search.length) return '';
  const query = new URLSearchParams(search).toString();
  return query ? `?${query}` : '';
};

export const safeNumber = (value) => {
  if (value === '' || value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const formatCurrency = (value, locale = 'en', currency = 'AED') => {
  const n = safeNumber(value);
  if (n === undefined) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
};

export const mergeParamsWithDefaults = (defaults, overrides) => ({
  ...defaults,
  ...(overrides || {})
});
