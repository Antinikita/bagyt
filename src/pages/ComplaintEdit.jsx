import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sanctumRequest } from '../config/sanctumRequest';
import { parseApiError } from '../utils/apiError';
import ComplaintAIAnalysis from '../components/ComplaintAIAnalysis';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';

export default function ComplaintEdit() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const isNew = complaintId === 'new';
  const [complaint, setComplaint] = useState({ complaint: '' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [error, setError] = useState('');

  const fetchComplaint = useCallback(
    async (signal) => {
      try {
        setError('');
        const response = await sanctumRequest('get', `/complaints/${complaintId}`, {}, { signal });
        setComplaint(response.data);
        setIsEditing(false);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(parseApiError(err, 'Failed to load complaint'));
      } finally {
        setLoading(false);
      }
    },
    [complaintId],
  );

  useEffect(() => {
    if (isNew) return;
    const controller = new AbortController();
    fetchComplaint(controller.signal);
    return () => controller.abort();
  }, [isNew, fetchComplaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (complaintId === 'new') {
        const { data } = await sanctumRequest('post', '/complaints', {
          complaint: complaint.complaint,
        });
        const newId = data?.complaint?.id ?? data?.id;
        if (newId) {
          navigate(`/admin/complaints/${newId}`, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        await sanctumRequest('put', `/complaints/${complaintId}`, {
          complaint: complaint.complaint,
        });
        setIsEditing(false);
        await fetchComplaint();
      }
    } catch (err) {
      setError(parseApiError(err, 'Failed to save complaint'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (complaintId === 'new') {
      navigate('/admin/dashboard');
    } else {
      setIsEditing(false);
      fetchComplaint();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        <span className="text-gray-600 dark:text-gray-300">Loading complaint…</span>
      </div>
    );
  }

  const heading =
    complaintId === 'new' ? 'New complaint' : isEditing ? 'Edit complaint' : 'View complaint';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 dark:bg-deep-800 dark:border-deep-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="t-h1">{heading}</h1>
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            Back
          </Button>
        </div>

        {error && (
          <div className="mb-5">
            <ErrorBanner message={error} />
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="complaint-text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
              >
                Complaint
              </label>
              <textarea
                id="complaint-text"
                rows={10}
                value={complaint.complaint}
                onChange={(e) => setComplaint({ ...complaint, complaint: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 resize-vertical dark:bg-deep-900 dark:text-gray-100 dark:border-deep-700"
                placeholder="Describe your complaint…"
                maxLength={1000}
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {complaint.complaint.length}/1000 characters
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
                disabled={saving}
              >
                {saving
                  ? 'Saving…'
                  : complaintId === 'new'
                    ? 'Create complaint'
                    : 'Update complaint'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="t-section">Complaint details</span>
                <Button variant="ghost" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 dark:bg-deep-900 dark:border-deep-700">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {complaint.complaint}
                </p>
              </div>

              {complaint.created_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Created:{' '}
                  {new Date(complaint.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated:{' '}
                  {new Date(complaint.updated_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            <ComplaintAIAnalysis complaint={complaint} />
          </div>
        )}
      </div>
    </div>
  );
}
