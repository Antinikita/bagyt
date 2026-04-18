import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

const RuFlag = (props) => (
  <svg viewBox="0 0 24 18" aria-hidden="true" {...props}>
    <rect width="24" height="6" y="0" fill="#fff" />
    <rect width="24" height="6" y="6" fill="#0039A6" />
    <rect width="24" height="6" y="12" fill="#D52B1E" />
  </svg>
);

const KzFlag = (props) => (
  <svg viewBox="0 0 24 18" aria-hidden="true" {...props}>
    <rect width="24" height="18" fill="#00AFCA" />
    <g transform="translate(12 9)" fill="#FEC50C">
      <circle r="2.6" fill="#FEC50C" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        return (
          <rect
            key={i}
            x="-0.22"
            y="-4"
            width="0.44"
            height="1.4"
            transform={`rotate(${(a * 180) / Math.PI})`}
          />
        );
      })}
    </g>
  </svg>
);

const GbFlag = (props) => (
  <svg viewBox="0 0 24 18" aria-hidden="true" {...props}>
    <rect width="24" height="18" fill="#012169" />
    <path d="M0 0l24 18M24 0L0 18" stroke="#fff" strokeWidth="2.4" />
    <path
      d="M0 0l24 18M24 0L0 18"
      stroke="#C8102E"
      strokeWidth="1.2"
      clipPath="url(#gbClip)"
    />
    <path d="M12 0v18M0 9h24" stroke="#fff" strokeWidth="4" />
    <path d="M12 0v18M0 9h24" stroke="#C8102E" strokeWidth="2" />
  </svg>
);

const LANGS = [
  { code: 'ru', labelKey: 'common.languageName', Flag: RuFlag },
  { code: 'kk', labelKey: 'common.languageName', Flag: KzFlag },
  { code: 'en', labelKey: 'common.languageName', Flag: GbFlag },
];

const LANG_NAMES = {
  ru: 'Русский',
  kk: 'Қазақша',
  en: 'English',
};

export default function LanguageSwitcher({ className = '', compact = false }) {
  const { i18n, t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const layoutId = useId();
  const current = LANGS.find((l) => l.code === i18n.resolvedLanguage) ?? LANGS[0];

  const change = (code) => {
    if (i18n.resolvedLanguage === code) return;
    i18n.changeLanguage(code);
  };

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`
        relative inline-flex items-center gap-0 rounded-full border border-gray-200/70
        bg-white/70 p-1 shadow-[0_4px_12px_-4px_rgba(40,30,90,0.12)]
        backdrop-blur-md
        dark:border-white/10 dark:bg-gray-900/50
        ${className}
      `}
    >
      {LANGS.map((lng) => {
        const isActive = current.code === lng.code;
        const showLabel = !compact || isActive;
        return (
          <button
            key={lng.code}
            type="button"
            onClick={() => change(lng.code)}
            aria-pressed={isActive}
            aria-label={LANG_NAMES[lng.code]}
            className={`
              relative z-[1] inline-flex items-center gap-2 rounded-full
              px-2.5 py-1.5 text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300
              focus-visible:ring-offset-1 focus-visible:ring-offset-white
              dark:focus-visible:ring-offset-gray-900
              ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }
            `}
          >
            {isActive && !prefersReduced && (
              <motion.span
                layoutId={`lang-pill-${layoutId}`}
                aria-hidden="true"
                className="absolute inset-0 -z-[1] rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-[0_6px_14px_-6px_rgba(102,57,245,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            {isActive && prefersReduced && (
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-[1] rounded-full bg-gradient-to-br from-brand-500 to-brand-600"
              />
            )}
            <span
              aria-hidden="true"
              className={`
                inline-flex h-5 w-[26px] items-center justify-center overflow-hidden
                rounded-[5px] ring-1 ring-black/5
                ${isActive ? 'ring-white/30' : ''}
              `}
            >
              <lng.Flag className="h-5 w-[26px]" />
            </span>
            {showLabel && <span>{LANG_NAMES[lng.code]}</span>}
          </button>
        );
      })}
    </div>
  );
}
