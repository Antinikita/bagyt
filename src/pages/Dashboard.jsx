import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, Sparkles, MessageSquare, FileText, Clock, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChatsList } from '../api/hooks/useChats';
import { useAnamnesesList } from '../api/hooks/useAnamneses';
import { getDateLocale } from '../lib/locale';
import HealthSummaryCard from '../components/HealthSummaryCard';

function Stat({ icon: Icon, label, value, hint, tint }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-brand dark:border-deep-700 dark:bg-deep-800">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
        {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);

  const chatsQuery = useChatsList({ page: 1, perPage: 5 });
  const anamnesesQuery = useAnamnesesList({ page: 1, perPage: 1 });

  const loading = chatsQuery.isLoading || anamnesesQuery.isLoading;
  const chats = chatsQuery.data?.data ?? [];
  const chatsTotal = chatsQuery.data?.total ?? 0;
  const anamnesesTotal = anamnesesQuery.data?.total ?? 0;

  const lastDate = chats[0]?.updated_at || chats[0]?.created_at;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <section className="relative overflow-hidden rounded-2xl bg-grad-cta-deep p-8 text-white shadow-xl">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-200/90">
            {t('dashboard.label')}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {user?.name ? t('dashboard.welcomeWithName', { name: user.name }) : t('dashboard.welcome')}
          </h1>
          <p className="mt-2 max-w-xl text-white/80">{t('dashboard.subtitle')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/chats"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-deep-700 shadow-pill transition-colors hover:bg-brand-400"
            >
              <Plus className="h-4 w-4" />
              {t('dashboard.startChat')}
            </Link>
            <Link
              to="/admin/anamneses"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <FileText className="h-4 w-4" />
              {t('nav.anamneses')}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          icon={MessageSquare}
          label={t('dashboard.totalChats')}
          value={loading ? '—' : chatsTotal}
          hint={t('dashboard.allTime')}
          tint="bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300"
        />
        <Stat
          icon={FileText}
          label={t('dashboard.totalAnamneses')}
          value={loading ? '—' : anamnesesTotal}
          hint={t('dashboard.generatedByAi')}
          tint="bg-purple-50 text-purple-700 dark:bg-deep-700 dark:text-purple-300"
        />
        <Stat
          icon={Clock}
          label={t('dashboard.lastActivity')}
          value={loading ? '—' : lastDate
            ? new Date(lastDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
            : '—'}
          hint={lastDate
            ? new Date(lastDate).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
            : t('dashboard.nothingYet')}
          tint="bg-emerald-50 text-emerald-700 dark:bg-deep-700 dark:text-emerald-300"
        />
      </section>

      <section>
        <HealthSummaryCard />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recentChats')}
              </h2>
            </div>
            <Link
              to="/admin/chats"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {t('nav.viewAll')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-deep-700/50" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-deep-700">
              <MessageSquare className="h-10 w-10 text-gray-300 dark:text-deep-600" />
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('dashboard.noChatsYet')}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('dashboard.startFirstChat')}
              </p>
              <Link
                to="/admin/chats"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-semibold text-deep-700 shadow-pill transition-colors hover:bg-brand-400"
              >
                <Plus className="h-4 w-4" />
                {t('dashboard.startChat')}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-deep-700">
              {chats.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/admin/chats/${c.id}`}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-deep-700/40 -mx-2 px-2 rounded-lg"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-700 dark:bg-deep-700 dark:text-gray-400 dark:group-hover:bg-deep-600 dark:group-hover:text-brand-300">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {(c.title || t('common.untitled')).slice(0, 80)}
                      </p>
                      {c.last_message && (
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {c.last_message}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('dashboard.howItWorks')}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t('dashboard.howDesc')}
              </p>
            </div>
          </div>
          <ol className="mt-5 space-y-3 text-sm">
            {[t('dashboard.step1'), t('dashboard.step2'), t('dashboard.step3')].map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-deep-700 dark:text-brand-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
