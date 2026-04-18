import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, User, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../utils/apiError';
import { validateRegister, mapBackendErrors } from '../utils/registerValidation';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import PasswordInput from '../components/ui/PasswordInput';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import Divider from '../components/ui/Divider';
import SocialButton from '../components/ui/SocialButton';
import AuthCard from '../components/AuthCard';
import AuthLogo from '../components/AuthLogo';

const INITIAL_VALUES = {
  name: '',
  email: '',
  sex: '',
  age: '',
  password: '',
  passwordConfirmation: '',
};

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const clientErrors = useMemo(() => validateRegister(values, t), [values, t]);
  const errors = { ...clientErrors, ...serverErrors };
  const isValid = Object.keys(clientErrors).length === 0;

  const setValue = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (serverErrors[key]) {
      setServerErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  const handleBlur = (key) => setTouched((tt) => ({ ...tt, [key]: true }));
  const shouldShow = (key) => Boolean((touched[key] || submitted) && errors[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError('');
    if (!isValid) return;

    setSubmitting(true);
    try {
      const parsedAge = Number(values.age);
      await register(
        values.name.trim(),
        values.email.trim(),
        values.sex,
        parsedAge,
        values.password,
        values.passwordConfirmation,
      );
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const mapped = mapBackendErrors(err);
      if (Object.keys(mapped).length > 0) {
        setServerErrors(mapped);
        setFormError(t('register.fixErrors'));
      } else {
        setFormError(parseApiError(err, t('register.failed')));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const container = prefersReduced
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
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
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      footer={
        <>
          {t('register.footerPrompt')}{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('register.footerLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <motion.div
          variants={container}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? false : 'show'}
          className="space-y-5"
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
            <Divider>{t('auth.orSignupEmail')}</Divider>
          </motion.div>

          <motion.section variants={item} className="space-y-3">
            <SectionLabel>{t('register.sectionAccount')}</SectionLabel>
            <Input
              label={t('register.nameLabel')}
              name="name"
              type="text"
              autoComplete="name"
              leading={<User className="h-4 w-4" aria-hidden="true" />}
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={shouldShow('name') ? errors.name : undefined}
              placeholder={t('register.namePlaceholder')}
              required
            />
            <Input
              label={t('register.emailLabel')}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              leading={<Mail className="h-4 w-4" aria-hidden="true" />}
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={shouldShow('email') ? errors.email : undefined}
              placeholder={t('register.emailPlaceholder')}
              required
            />
          </motion.section>

          <motion.section variants={item} className="space-y-3">
            <SectionLabel>{t('register.sectionProfile')}</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label={t('register.genderLabel')}
                name="sex"
                value={values.sex}
                onChange={(e) => setValue('sex', e.target.value)}
                onBlur={() => handleBlur('sex')}
                error={shouldShow('sex') ? errors.sex : undefined}
                required
              >
                <option value="" disabled>
                  {t('register.genderSelect')}
                </option>
                <option value="male">{t('register.genderMale')}</option>
                <option value="female">{t('register.genderFemale')}</option>
                <option value="other">{t('register.genderOther')}</option>
              </Select>
              <Input
                label={t('register.ageLabel')}
                name="age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                leading={<Hash className="h-4 w-4" aria-hidden="true" />}
                value={values.age}
                onChange={(e) => setValue('age', e.target.value)}
                onBlur={() => handleBlur('age')}
                error={shouldShow('age') ? errors.age : undefined}
                placeholder={t('register.agePlaceholder')}
                required
              />
            </div>
          </motion.section>

          <motion.section variants={item} className="space-y-3">
            <SectionLabel>{t('register.sectionSecurity')}</SectionLabel>
            <div>
              <PasswordInput
                label={t('register.passwordLabel')}
                name="password"
                autoComplete="new-password"
                minLength={6}
                leading={<Lock className="h-4 w-4" aria-hidden="true" />}
                value={values.password}
                onChange={(e) => setValue('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={shouldShow('password') ? errors.password : undefined}
                placeholder={t('register.passwordPlaceholder')}
                required
              />
              {values.password && (
                <PasswordStrengthMeter
                  password={values.password}
                  id="password-strength-label"
                />
              )}
            </div>
            <PasswordInput
              label={t('register.confirmLabel')}
              name="passwordConfirmation"
              autoComplete="new-password"
              minLength={6}
              leading={<Lock className="h-4 w-4" aria-hidden="true" />}
              value={values.passwordConfirmation}
              onChange={(e) => setValue('passwordConfirmation', e.target.value)}
              onBlur={() => handleBlur('passwordConfirmation')}
              error={
                shouldShow('passwordConfirmation') ? errors.passwordConfirmation : undefined
              }
              placeholder={t('register.confirmPlaceholder')}
              required
            />
          </motion.section>

          <motion.div variants={item}>
            <Button
              type="submit"
              loading={submitting}
              disabled={submitted && !isValid}
              className="w-full"
            >
              {submitting ? t('register.submitLoading') : t('register.submit')}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </AuthCard>
  );
}
