import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorBanner from '../components/ui/ErrorBanner';
import { forgotPassword } from '../api/auth';
import { extractApiError } from '../api/axios-client';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Backend always 200s on /forgot-password (no enumeration), so this
      // path is realistically only hit on network / 500 / 422-format-error.
      setError(extractApiError(err, 'common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      logo={<AuthLogo />}
      title={t('auth.forgotPasswordTitle')}
      subtitle={t('auth.forgotPasswordSubtitle')}
      footer={
        <Link
          to="/login"
          className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {error && <ErrorBanner message={error} className="mb-5 animate-shake" />}

      {submitted ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          {t('auth.resetLinkSent')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leading={<Mail className="h-4 w-4" />}
            required
          />
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
