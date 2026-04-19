import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import ErrorBanner from '../components/ui/ErrorBanner';
import Divider from '../components/ui/Divider';
import SocialButton from '../components/ui/SocialButton';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || t('auth.loginFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      logo={<AuthLogo />}
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInToContinue')}
      footer={
        <>
          {t('auth.dontHaveAccount')}{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
          >
            {t('auth.signUp')}
          </Link>
        </>
      }
    >
      {error && <ErrorBanner message={error} className="mb-5 animate-shake" />}

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

        <PasswordInput
          label={t('auth.password')}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
          aria-label={t('auth.signIn')}
        >
          {t('auth.signIn')}
        </Button>
      </form>

      <Divider className="my-6">{t('common.or')}</Divider>

      <div className="grid grid-cols-2 gap-2">
        <SocialButton provider="google" disabled />
        <SocialButton provider="github" disabled />
      </div>
    </AuthCard>
  );
}
