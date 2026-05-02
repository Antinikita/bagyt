import { useState } from 'react';
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
  Pencil,
  Save,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChatsList } from '../api/hooks/useChats';
import { useAnamnesesList } from '../api/hooks/useAnamneses';
import { extractApiError } from '../api/axios-client';
import { getInitials } from '../lib/initials';
import { getDateLocale } from '../lib/locale';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import PasswordInput from '../components/ui/PasswordInput';

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
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);
  const [loggingOut, setLoggingOut] = useState(false);

  // Personal-details inline edit state
  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [draft, setDraft] = useState({ name: '', sex: '', age: '' });

  // Change-password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });

  const SEX_LABEL = {
    male: t('profile.male'),
    female: t('profile.female'),
    other: t('profile.other'),
  };

  const startEditDetails = () => {
    setDraft({
      name: user?.name ?? '',
      sex: user?.sex ?? '',
      age: user?.age ?? '',
    });
    setDetailsError('');
    setDetailsSuccess('');
    setEditingDetails(true);
  };

  const cancelEditDetails = () => {
    setEditingDetails(false);
    setDetailsError('');
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setDetailsError('');
    setSavingDetails(true);
    try {
      await updateProfile({
        name: draft.name.trim(),
        sex: draft.sex || null,
        age: draft.age === '' ? null : Number(draft.age),
      });
      setEditingDetails(false);
      setDetailsSuccess(t('profile.detailsSaved'));
      setTimeout(() => setDetailsSuccess(''), 3000);
    } catch (err) {
      setDetailsError(extractApiError(err, 'profile.detailsFailed'));
    } finally {
      setSavingDetails(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (pwd.password !== pwd.password_confirmation) {
      setPasswordError(t('auth.passwordsDontMatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      setShowPasswordForm(false);
      setPasswordSuccess(t('profile.passwordChanged'));
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(extractApiError(err, 'profile.passwordFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const chatsQuery = useChatsList({ page: 1, perPage: 1 });
  const anamnesesQuery = useAnamnesesList({ page: 1, perPage: 1 });

  const loading = chatsQuery.isLoading || anamnesesQuery.isLoading;
  const total = chatsQuery.data?.total ?? 0;
  const analyzed = anamnesesQuery.data?.total ?? 0;
  const latestChat = chatsQuery.data?.data?.[0];
  const lastDate = latestChat?.updated_at || latestChat?.created_at || null;

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
        <Card
          icon={UserCircle2}
          title={t('profile.personalDetails')}
          action={!editingDetails && (
            <button
              type="button"
              onClick={startEditDetails}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              {t('common.edit')}
            </button>
          )}
        >
          {detailsSuccess && (
            <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
              {detailsSuccess}
            </div>
          )}
          {detailsError && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {detailsError}
            </div>
          )}

          {!editingDetails ? (
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
          ) : (
            <form onSubmit={saveDetails} className="space-y-3">
              <Input
                label={t('profile.fullName')}
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.emailNotEditable')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={t('profile.sex')}
                  value={draft.sex}
                  onChange={(e) => setDraft((d) => ({ ...d, sex: e.target.value }))}
                >
                  <option value="">{t('auth.preferNotToSay')}</option>
                  <option value="male">{t('profile.male')}</option>
                  <option value="female">{t('profile.female')}</option>
                  <option value="other">{t('profile.other')}</option>
                </Select>
                <Input
                  label={t('profile.age')}
                  type="number"
                  min={0}
                  max={150}
                  value={draft.age}
                  onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={cancelEditDetails} disabled={savingDetails}>
                  <X className="h-4 w-4" /> {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" loading={savingDetails}>
                  <Save className="h-4 w-4" /> {t('common.save')}
                </Button>
              </div>
            </form>
          )}
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

      {/* Session + password */}
      <Card icon={ShieldCheck} title={t('profile.security')}>
        {passwordSuccess && (
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            {passwordSuccess}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('profile.password')}
            </p>
            <p className="mt-0.5 font-mono text-sm tracking-widest text-gray-500 dark:text-gray-400">
              ••••••••••
            </p>
            {!showPasswordForm && (
              <button
                type="button"
                onClick={() => { setShowPasswordForm(true); setPasswordError(''); }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
              >
                <KeyRound className="h-3 w-3" aria-hidden="true" />
                {t('profile.changePassword')}
              </button>
            )}
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

        {showPasswordForm && (
          <form onSubmit={submitPasswordChange} className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-deep-700/70">
            {passwordError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {passwordError}
              </div>
            )}
            <PasswordInput
              label={t('profile.currentPassword')}
              autoComplete="current-password"
              value={pwd.current_password}
              onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))}
              required
            />
            <PasswordInput
              label={t('profile.newPassword')}
              autoComplete="new-password"
              value={pwd.password}
              onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <PasswordInput
              label={t('profile.confirmNewPassword')}
              autoComplete="new-password"
              value={pwd.password_confirmation}
              onChange={(e) => setPwd((p) => ({ ...p, password_confirmation: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('profile.passwordRevokeNote')}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError('');
                  setPwd({ current_password: '', password: '', password_confirmation: '' });
                }}
                disabled={savingPassword}
              >
                <X className="h-4 w-4" /> {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" loading={savingPassword}>
                <Save className="h-4 w-4" /> {t('profile.updatePassword')}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
