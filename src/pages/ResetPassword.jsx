import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import ErrorBanner from '../components/ui/ErrorBanner';
import { resetPassword } from '../api/auth';
import { extractApiError } from '../api/axios-client';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const missing = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      // Sign in with the new password — go to login with a friendly message.
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(extractApiError(err, 'common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      logo={<AuthLogo />}
      title={t('auth.resetPasswordTitle')}
      subtitle={t('auth.resetPasswordSubtitle')}
      footer={
        <Link
          to="/login"
          className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {missing ? (
        <ErrorBanner message={t('auth.resetMissingParams')} />
      ) : (
        <>
          {error && <ErrorBanner message={error} className="mb-5 animate-shake" />}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Hidden username field so password managers know which account this scopes to. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={email}
              readOnly
              hidden
              tabIndex={-1}
              aria-hidden="true"
            />
            <PasswordInput
              label={t('auth.newPassword')}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              label={t('auth.confirmNewPassword')}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              {t('profile.updatePassword')}
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
