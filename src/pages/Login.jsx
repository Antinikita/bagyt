import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { parseApiError } from '../utils/apiError';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import PasswordInput from '../components/ui/PasswordInput';
import Checkbox from '../components/ui/Checkbox';
import Divider from '../components/ui/Divider';
import SocialButton from '../components/ui/SocialButton';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBERED_KEY = 'auth:rememberedEmail';

function validateLogin(values, t) {
  const errors = {};
  if (!values.email) errors.email = t('validation.emailRequired');
  else if (!EMAIL_RE.test(values.email)) errors.email = t('validation.emailInvalid');
  if (!values.password) errors.password = t('validation.passwordRequired');
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const initialRemembered =
    typeof window !== 'undefined' ? window.localStorage.getItem(REMEMBERED_KEY) ?? '' : '';

  const [values, setValues] = useState({
    email: initialRemembered,
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(Boolean(initialRemembered));
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validateLogin(values, t), [values, t]);
  const isValid = Object.keys(errors).length === 0;

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const handleBlur = (key) => setTouched((tt) => ({ ...tt, [key]: true }));
  const shouldShow = (key) => Boolean((touched[key] || submitted) && errors[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (!isValid) return;

    setLoading(true);
    try {
      await login(values.email, values.password);
      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_KEY, values.email);
      } else {
        window.localStorage.removeItem(REMEMBERED_KEY);
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setFormError(parseApiError(err, t('login.invalidCredentials')));
    } finally {
      setLoading(false);
    }
  };

  const container = prefersReduced
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
      };
  const item = prefersReduced
    ? {}
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
      };

  return (
    <AuthCard
      logo={<AuthLogo />}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <>
          {t('login.footerPrompt')}{' '}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('login.footerLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <motion.div
          variants={container}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? false : 'show'}
          className="space-y-4"
        >
          {formError && (
            <motion.div
              variants={item}
              key={formError}
              animate={prefersReduced ? undefined : { x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
            >
              <ErrorBanner message={formError} />
            </motion.div>
          )}

          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <SocialButton provider="google" />
            <SocialButton provider="github" />
          </motion.div>

          <motion.div variants={item}>
            <Divider>{t('auth.orContinueEmail')}</Divider>
          </motion.div>

          <motion.div variants={item}>
            <Input
              label={t('login.emailLabel')}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              leading={<Mail className="h-4 w-4" aria-hidden="true" />}
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={shouldShow('email') ? errors.email : undefined}
              placeholder={t('login.emailPlaceholder')}
              required
            />
          </motion.div>

          <motion.div variants={item}>
            <PasswordInput
              label={t('login.passwordLabel')}
              name="password"
              autoComplete="current-password"
              leading={<Lock className="h-4 w-4" aria-hidden="true" />}
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={shouldShow('password') ? errors.password : undefined}
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </motion.div>

          <motion.div
            variants={item}
            className="flex items-center justify-between pt-1"
          >
            <Checkbox
              label={t('login.rememberMe')}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t('login.forgotPassword')}
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Button
              type="submit"
              loading={loading}
              disabled={submitted && !isValid}
              className="w-full"
            >
              {loading ? t('login.submitLoading') : t('login.submit')}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </AuthCard>
  );
}
