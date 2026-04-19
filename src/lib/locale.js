const MAP = {
  en: 'en-US',
  ru: 'ru-RU',
  kk: 'kk-KZ',
};

export function getDateLocale(lng) {
  if (!lng) return 'en-US';
  const base = lng.split('-')[0].toLowerCase();
  return MAP[base] ?? 'en-US';
}
