const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(values, t = (k) => k) {
  const errors = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = t('validation.nameTooShort');
  } else if (values.name.length > 255) {
    errors.name = t('validation.nameTooLong');
  }

  if (!values.email) {
    errors.email = t('validation.emailRequired');
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = t('validation.emailInvalid');
  }

  if (!values.sex) {
    errors.sex = t('validation.sexRequired');
  } else if (!['male', 'female', 'other'].includes(values.sex)) {
    errors.sex = t('validation.sexInvalid');
  }

  if (values.age === '' || values.age === null || values.age === undefined) {
    errors.age = t('validation.ageRequired');
  } else {
    const n = Number(values.age);
    if (!Number.isInteger(n) || n < 0 || n > 120) {
      errors.age = t('validation.ageInvalid');
    }
  }

  if (!values.password) {
    errors.password = t('validation.passwordRequired');
  } else if (values.password.length < 6) {
    errors.password = t('validation.passwordTooShort');
  }

  if (!values.passwordConfirmation) {
    errors.passwordConfirmation = t('validation.confirmRequired');
  } else if (values.password && values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = t('validation.confirmMismatch');
  }

  return errors;
}

const FIELD_MAP = {
  name: 'name',
  email: 'email',
  sex: 'sex',
  age: 'age',
  password: 'password',
  password_confirmation: 'passwordConfirmation',
};

export function mapBackendErrors(err) {
  const backend = err?.response?.data?.errors;
  if (!backend || typeof backend !== 'object') return {};
  const mapped = {};
  for (const [key, messages] of Object.entries(backend)) {
    const field = FIELD_MAP[key] ?? key;
    const first = Array.isArray(messages) ? messages[0] : messages;
    if (typeof first === 'string') mapped[field] = first;
  }
  return mapped;
}
