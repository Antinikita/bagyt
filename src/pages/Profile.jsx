import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCircle2,
  Activity,
  Settings2,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listChats } from '../api/chats';
import { listAnamneses } from '../api/anamneses';
import { getInitials } from '../lib/initials';
import { getDateLocale } from '../lib/locale';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import Button from '../components/ui/Button';

function formatDate(value, locale, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, opts);
}

function Card({ icon: Icon, title, action, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800 ${className}`}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 dark:border-deep-700/70">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100 sm:text-right">
        {children}
      </dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, tint }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-deep-700 dark:bg-deep-700/40">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);
  const [chatsTotal, setChatsTotal] = useState(0);
  const [anamnesesTotal, setAnamnesesTotal] = useState(0);
  const [lastChatDate, setLastChatDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const SEX_LABEL = {
    male: t('profile.male'),
    female: t('profile.female'),
    other: t('profile.other'),
  };

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listChats({ page: 1, perPage: 1 }),
      listAnamneses({ page: 1, perPage: 1 }),
    ]).then(([chatsRes, anamnesesRes]) => {
      if (cancelled) return;
      if (chatsRes.status === 'fulfilled') {
        setChatsTotal(chatsRes.value.total ?? 0);
        const latest = chatsRes.value.data?.[0];
        setLastChatDate(latest?.updated_at || latest?.created_at || null);
      }
      if (anamnesesRes.status === 'fulfilled') {
        setAnamnesesTotal(anamnesesRes.value.total ?? 0);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const total = chatsTotal;
  const analyzed = anamnesesTotal;
  const lastDate = lastChatDate;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  const initials = getInitials(user.name);
  const verified = Boolean(user.email_verified_at);
  const sexLabel = user.sex ? SEX_LABEL[user.sex] ?? user.sex : '—';
  const ageLabel = user.age != null ? String(user.age) : '—';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-grad-cta-deep p-6 text-white shadow-xl sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-brand-500/15 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div
            aria-hidden="true"
            className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-grad-pill text-2xl font-bold text-deep-800 shadow-pill ring-4 ring-white/15"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-200/90">
              {t('profile.title')}
            </p>
            <h1 className="mt-1 truncate text-3xl font-bold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  {t('common.verified')}
                </span>
              )}
            </div>
            {user.created_at && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {t('profile.memberSince', { date: formatDate(user.created_at, locale) })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Grid: Personal details + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card icon={UserCircle2} title={t('profile.personalDetails')}>
          <dl>
            <Field label={t('profile.fullName')}>{user.name}</Field>
            <Field label={t('profile.email')}>
              <span className="inline-flex items-center gap-2">
                <span className="break-all">{user.email}</span>
                {verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    {t('common.verified')}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {t('common.unverified')}
                  </span>
                )}
              </span>
            </Field>
            <Field label={t('profile.sex')}>{sexLabel}</Field>
            <Field label={t('profile.age')}>{ageLabel}</Field>
            <Field label={t('profile.accountCreated')}>{formatDate(user.created_at, locale)}</Field>
          </dl>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {t('profile.editingSoon')}
          </p>
        </Card>

        <Card icon={Activity} title={t('profile.activity')}>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[104px] animate-pulse rounded-xl bg-gray-100 dark:bg-deep-700/50"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                icon={MessageSquare}
                label={t('profile.total')}
                value={total}
                hint={t('profile.allChats')}
                tint="bg-brand-50 text-brand-700 dark:bg-deep-800 dark:text-brand-300"
              />
              <Stat
                icon={FileText}
                label={t('profile.anamneses')}
                value={analyzed}
                hint={t('profile.generatedByAi')}
                tint="bg-purple-50 text-purple-700 dark:bg-deep-800 dark:text-purple-300"
              />
              <Stat
                icon={Clock}
                label={t('profile.lastActivity')}
                value={lastDate ? formatDate(lastDate, locale, { month: 'short', day: 'numeric' }) : '—'}
                hint={
                  lastDate
                    ? new Date(lastDate).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : t('profile.nothingYet')
                }
                tint="bg-emerald-50 text-emerald-700 dark:bg-deep-800 dark:text-emerald-300"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Preferences */}
      <Card icon={Settings2} title={t('profile.preferences')}>
        <div className="divide-y divide-gray-100 dark:divide-deep-700/70">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('profile.theme')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.themeDesc')}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-3 py-3 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('profile.language')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.languageDesc')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </Card>

      {/* Session */}
      <Card icon={ShieldCheck} title={t('profile.security')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('profile.password')}
            </p>
            <p className="mt-0.5 font-mono text-sm tracking-widest text-gray-500 dark:text-gray-400">
              ••••••••••
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('profile.passwordSoon')}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="danger"
              onClick={handleLogout}
              loading={loggingOut}
              aria-label={t('profile.logOutAria')}
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t('profile.logOut')}
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
