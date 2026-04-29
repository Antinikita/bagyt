import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2, Save, Pencil, X } from 'lucide-react';
import { ANAMNESIS_FIELDS } from '../api/anamneses';
import { useAnamnesis, useUpdateAnamnesis, useDeleteAnamnesis } from '../api/hooks/useAnamneses';
import { extractApiError } from '../api/axios-client';
import Button from '../components/ui/Button';

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
