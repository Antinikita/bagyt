import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2, Save, Pencil, X, Footprints, Heart, Moon } from 'lucide-react';
import { ANAMNESIS_FIELDS } from '../api/anamneses';
import { useAnamnesis, useUpdateAnamnesis, useDeleteAnamnesis } from '../api/hooks/useAnamneses';
import { extractApiError } from '../api/axios-client';
import { formatSleep, formatNormRange } from '../lib/health';
import Button from '../components/ui/Button';

const STATUS_TONE = {
  below: 'text-amber-700 dark:text-amber-300',
  normal: 'text-emerald-700 dark:text-emerald-300',
  above: 'text-sky-700 dark:text-sky-300',
};

const STATUS_DOT = {
  below: 'bg-amber-500',
  normal: 'bg-emerald-500',
  above: 'bg-sky-500',
};

const HEALTH_ICONS = {
  steps: Footprints,
  heart_rate: Heart,
  sleep_duration: Moon,
};

export default function AnamnesisDetail() {
  const { anamnesisId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const query = useAnamnesis(anamnesisId);
  const updateMutation = useUpdateAnamnesis(anamnesisId);
  const deleteMutation = useDeleteAnamnesis();

  const anamnesis = query.data ?? null;
  const loading = query.isLoading;
  const queryError = query.isError
    ? (query.error?.response?.status === 404
        ? t('anamneses.notFound')
        : extractApiError(query.error, 'anamneses.failedLoad'))
    : '';

  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saving = updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const displayError = error || queryError;

  const startEdit = () => {
    const initial = {};
    ANAMNESIS_FIELDS.forEach((f) => { initial[f] = anamnesis[f] ?? ''; });
    setDraft(initial);
    setEditing(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      await updateMutation.mutateAsync(draft);
      setEditing(false);
    } catch (err) {
      setError(extractApiError(err, 'anamneses.failedSave'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(anamnesisId);
      navigate('/admin/anamneses');
    } catch (err) {
      setError(extractApiError(err, 'anamneses.failedDelete'));
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
      </div>
    );
  }

  if (!anamnesis) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">{displayError || t('anamneses.notFound')}</p>
        <Link to="/admin/anamneses" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> {t('anamneses.backToList')}
        </Link>
      </div>
    );
  }

  const rawFallback = anamnesis.ai_raw_response?.raw_text;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/anamneses"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-deep-700"
            aria-label={t('anamneses.backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {anamnesis.chief_complaint || t('anamneses.untitled')}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {new Date(anamnesis.generated_at || anamnesis.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="secondary" onClick={startEdit}>
                <Pencil className="h-4 w-4" /> {t('common.edit')}
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> {t('common.delete')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                <X className="h-4 w-4" /> {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" /> {t('common.save')}
              </Button>
            </>
          )}
        </div>
      </header>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {displayError}
        </div>
      )}

      {rawFallback && !editing && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">{t('anamneses.rawFallbackTitle')}</p>
          <p className="mt-1 text-xs">{t('anamneses.rawFallbackHint')}</p>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-white/60 p-2 text-xs dark:bg-deep-900/40">{rawFallback}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ANAMNESIS_FIELDS.map((field) => (
          <AnamnesisField
            key={field}
            label={t(`anamneses.fields.${field}`)}
            value={editing ? draft[field] : anamnesis[field]}
            editing={editing}
            onChange={(v) => setDraft((d) => ({ ...d, [field]: v }))}
          />
        ))}
      </div>

      {anamnesis.health_context && !editing && (
        <HealthContextPanel
          context={anamnesis.health_context}
          generatedAt={anamnesis.generated_at || anamnesis.created_at}
        />
      )}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-deep-700 dark:bg-deep-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('anamneses.deleteConfirmTitle')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t('anamneses.deleteConfirmMsg')}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-deep-600 dark:bg-deep-700 dark:text-gray-100 dark:hover:bg-deep-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthContextPanel({ context, generatedAt }) {
  const { t, i18n } = useTranslation();

  const rows = ['steps', 'heart_rate', 'sleep_duration']
    .filter((type) => context[type])
    .map((type) => {
      const m = context[type];
      const Icon = HEALTH_ICONS[type];
      let valueText;
      if (type === 'sleep_duration') valueText = formatSleep(m.value);
      else if (type === 'heart_rate') valueText = `${Math.round(m.value)} ${t('health.bpm')}`;
      else valueText = Math.round(m.value).toLocaleString();

      let normText = '';
      if (type === 'steps' && m.norm) {
        normText = `${(m.norm.target ?? 0).toLocaleString()} ${t('health.target').toLowerCase()}`;
      } else if (type === 'heart_rate') {
        normText = formatNormRange(m.norm);
      } else if (type === 'sleep_duration' && m.norm) {
        normText = `${Math.round((m.norm.min ?? 0) / 60)}–${Math.round((m.norm.max ?? 0) / 60)}h`;
      }

      return { type, Icon, valueText, normText, status: m.status };
    });

  if (rows.length === 0) return null;

  const captured = generatedAt
    ? new Date(generatedAt).toLocaleDateString(i18n.resolvedLanguage, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t('anamneses.healthAtGeneration')}
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {t('health.capturedAt', { date: captured })}
        </p>
      </header>

      <ul className="space-y-2">
        {rows.map(({ type, Icon, valueText, normText, status }) => (
          <li
            key={type}
            className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 last:border-b-0 dark:border-deep-700/60"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500 dark:bg-deep-700 dark:text-gray-300">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                {t(`health.types.${type}`)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{valueText}</span>
              {normText && (
                <span className="text-gray-500 dark:text-gray-400">{normText}</span>
              )}
              {status && (
                <span className={`inline-flex items-center gap-1 font-medium ${STATUS_TONE[status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                  {t(`health.status${status[0].toUpperCase()}${status.slice(1)}`)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
        {t('health.educationalDisclaimer')}
      </p>
    </section>
  );
}

function AnamnesisField({ label, value, editing, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-deep-700 dark:bg-deep-800">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      {editing ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-400 dark:border-deep-700 dark:bg-deep-900 dark:text-white"
        />
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
          {value || <span className="text-gray-400 dark:text-gray-500">{t('anamneses.notProvided')}</span>}
        </p>
      )}
    </div>
  );
}
