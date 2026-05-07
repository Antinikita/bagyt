import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle2, Pencil, Save, X } from 'lucide-react';
import { extractApiError } from '../../api/axios-client';
import { useAuth } from '../../context/AuthContext';
import { getDateLocale } from '../../lib/locale';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

function formatDate(value, locale) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
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

export default function PersonalDetailsCard() {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draft, setDraft] = useState({ name: '', sex: '', age: '' });

  const sexLabels = {
    male: t('profile.male'),
    female: t('profile.female'),
    other: t('profile.other'),
  };
  const sexLabel = user.sex ? sexLabels[user.sex] ?? user.sex : '—';
  const ageLabel = user.age != null ? String(user.age) : '—';

  const startEdit = () => {
    setDraft({
      name: user?.name ?? '',
      sex: user?.sex ?? '',
      age: user?.age ?? '',
    });
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({
        name: draft.name.trim(),
        sex: draft.sex || null,
        age: draft.age === '' ? null : Number(draft.age),
      });
      setEditing(false);
      setSuccess(t('profile.detailsSaved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(extractApiError(err, 'profile.detailsFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <UserCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.personalDetails')}
          </h2>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            {t('common.edit')}
          </button>
        )}
      </header>

      {success && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {!editing ? (
        <dl>
          <Field label={t('profile.fullName')}>{user.name}</Field>
          <Field label={t('profile.email')}>
            <span className="break-all">{user.email}</span>
          </Field>
          <Field label={t('profile.sex')}>{sexLabel}</Field>
          <Field label={t('profile.age')}>{ageLabel}</Field>
          <Field label={t('profile.accountCreated')}>{formatDate(user.created_at, locale)}</Field>
        </dl>
      ) : (
        <form onSubmit={save} className="space-y-3">
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
            <Button type="button" variant="secondary" onClick={cancel} disabled={saving}>
              <X className="h-4 w-4" /> {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="h-4 w-4" /> {t('common.save')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
