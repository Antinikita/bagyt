import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, User } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import ErrorBanner from '../components/ui/ErrorBanner';
import Divider from '../components/ui/Divider';
import SocialButton from '../components/ui/SocialButton';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../api/axios-client';

const initial = {
  name: '',
  email: '',
  sex: '',
  age: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    if (!formData.agreeToTerms) {
      setError(t('auth.agreeToTerms'));
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.sex || null,
        formData.age ? Number(formData.age) : null,
        formData.password,
        formData.confirmPassword,
      );
      navigate('/admin/dashboard');
    } catch (err) {
      setError(extractApiError(err, 'auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      logo={<AuthLogo />}
      title={t('auth.createAccount')}
      subtitle={t('auth.getStarted')}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
          >
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      {error && <ErrorBanner message={error} className="mb-5 animate-shake" />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label={t('auth.fullName')}
          type="text"
          name="name"
          autoComplete="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          leading={<User className="h-4 w-4" />}
          required
        />

        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          leading={<Mail className="h-4 w-4" />}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t('auth.sex')}
            name="sex"
            value={formData.sex}
            onChange={handleChange}
          >
            <option value="">{t('auth.preferNotToSay')}</option>
            <option value="male">{t('auth.male')}</option>
            <option value="female">{t('auth.female')}</option>
            <option value="other">{t('auth.other')}</option>
          </Select>
          <Input
            label={t('auth.age')}
            type="number"
            name="age"
            min={1}
            max={120}
            placeholder="28"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <PasswordInput
            label={t('auth.password')}
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <PasswordStrengthMeter password={formData.password} id="strength" />
        </div>

        <PasswordInput
          label={t('auth.confirmPassword')}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Checkbox
          name="agreeToTerms"
          label={
            <span>
              {t('auth.iAgreeTo')}{' '}
              <a
                href="/terms"
                className="font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t('auth.termsAndConditions')}
              </a>
            </span>
          }
          checked={formData.agreeToTerms}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          {t('auth.signUp')}
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
