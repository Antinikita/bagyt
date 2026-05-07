import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '../ui/Button';
import PasswordInput from '../ui/PasswordInput';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../api/auth';
import { extractApiError } from '../../api/axios-client';

export default function DangerZone() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cancel = () => {
    setConfirming(false);
    setPassword('');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await deleteAccount(password);
      // Backend already revoked all tokens; clear local state too via storage
      // event the AuthProvider listens for. Then redirect.
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:expired'));
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'profile.deleteAccountFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
      <header className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
          {t('profile.deleteAccount')}
        </h2>
      </header>

      <p className="text-sm text-red-900/80 dark:text-red-200/80">
        {t('profile.deleteAccountWarn')}
      </p>

      {!confirming ? (
        <div className="mt-4">
          <Button variant="danger" onClick={() => setConfirming(true)}>
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('profile.deleteAccount')}
            </span>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-red-200/60 pt-4 dark:border-red-900/40">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            {t('profile.deleteConfirmTitle')}
          </p>
          <p className="text-xs text-red-900/70 dark:text-red-200/70">
            {t('profile.deleteConfirmBody')}
          </p>
          {/* Hidden username so password managers know which account this scopes to. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={user?.email ?? ''}
            readOnly
            hidden
            tabIndex={-1}
            aria-hidden="true"
          />
          {error && (
            <div className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}
          <PasswordInput
            label={t('profile.currentPassword')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={cancel} disabled={submitting}>
              <X className="h-4 w-4" /> {t('common.cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={submitting}>
              <Trash2 className="h-4 w-4" /> {t('profile.deleteAccount')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
