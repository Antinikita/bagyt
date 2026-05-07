import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, LogOut, KeyRound, Save, X } from 'lucide-react';
import { extractApiError } from '../../api/axios-client';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import PasswordInput from '../ui/PasswordInput';

export default function SecurityCard() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });

  const [loggingOut, setLoggingOut] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (pwd.password !== pwd.password_confirmation) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setSaving(true);
    try {
      await changePassword(pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      setShowForm(false);
      setSuccess(t('profile.passwordChanged'));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(extractApiError(err, 'profile.passwordFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const cancelPasswordChange = () => {
    setShowForm(false);
    setError('');
    setPwd({ current_password: '', password: '', password_confirmation: '' });
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.security')}
          </h2>
        </div>
      </header>

      {success && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          {success}
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
          {!showForm && (
            <button
              type="button"
              onClick={() => { setShowForm(true); setError(''); }}
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

      {showForm && (
        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-deep-700/70">
          {/*
            Hidden username field. Browsers / password managers use this
            to scope the password-change form to ONE account — without it,
            Chrome/Firefox show a stored-credentials picker over the
            password fields, letting the user pick which saved login to
            autofill (very confusing here, since they're changing THEIR
            own password, not picking one).
          */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={user.email}
            readOnly
            hidden
            tabIndex={-1}
            aria-hidden="true"
          />
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
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
            <Button type="button" variant="secondary" onClick={cancelPasswordChange} disabled={saving}>
              <X className="h-4 w-4" /> {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="h-4 w-4" /> {t('profile.updatePassword')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
