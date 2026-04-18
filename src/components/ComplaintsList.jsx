import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { sanctumRequest } from '../config/sanctumRequest';
import { parseApiError } from '../utils/apiError';
import Button from './ui/Button';

export default function ComplaintsList() {
  const { complaintId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [listError, setListError] = useState('');
  const [modalError, setModalError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComplaints = useCallback(async (signal) => {
    try {
      setListError('');
      const response = await sanctumRequest('get', '/complaints', {}, { signal });
      const body = response.data;
      const complaintsArray = Array.isArray(body)
        ? body
        : Array.isArray(body?.complaints)
          ? body.complaints
          : Array.isArray(body?.complaints?.data)
            ? body.complaints.data
            : [];
      const mapped = complaintsArray.map((c) => ({
        id: c.id,
        complaint: c.complaint,
        created_at: c.created_at,
        user_id: c.user_id,
        latest_recommendation: c.latest_recommendation || null,
      }));
      setComplaints(mapped);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
      setListError(parseApiError(error, 'Failed to load complaints'));
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchComplaints(controller.signal);
    return () => controller.abort();
  }, [fetchComplaints]);

  const addComplaint = async () => {
    const text = newComplaint.trim();
    if (!text) return;
    try {
      setAdding(true);
      setModalError('');
      await sanctumRequest('post', '/complaints', { complaint: text });
      setNewComplaint('');
      setShowAddModal(false);
      await fetchComplaints();
    } catch (error) {
      setModalError(parseApiError(error, 'Failed to add complaint'));
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setDeleting(true);
      await sanctumRequest('delete', `/complaints/${pendingDeleteId}`);
      setPendingDeleteId(null);
      await fetchComplaints();
    } catch (error) {
      setListError(parseApiError(error, 'Failed to delete complaint'));
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        <span className="sr-only">Loading complaints…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => {
          setModalError('');
          setShowAddModal(true);
        }}
        disabled={adding}
        className="block w-full rounded-2xl bg-brand-500 text-deep-700 hover:bg-brand-600 hover:text-white p-5 text-base font-semibold shadow-brand transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          {adding ? 'Adding complaint…' : 'Add new complaint'}
        </span>
      </button>

        {listError && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {listError}
          </div>
        )}

        {showAddModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-complaint-heading"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !adding && setShowAddModal(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && !adding) setShowAddModal(false);
            }}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-200 bg-grad-ai">
                <h2 id="new-complaint-heading" className="t-h1">
                  New complaint
                </h2>
                <p className="text-gray-600 mt-2">Describe your issue in detail.</p>
              </div>

              <div className="p-8">
                <label htmlFor="new-complaint-textarea" className="sr-only">
                  New complaint
                </label>
                <textarea
                  id="new-complaint-textarea"
                  rows={8}
                  autoFocus
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Please describe your complaint in as much detail as possible…"
                  className="w-full p-6 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 resize-none text-lg leading-relaxed"
                  disabled={adding}
                  maxLength={1000}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {newComplaint.length}/1000 characters
                </div>
                {modalError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  >
                    {modalError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={addComplaint}
                  disabled={!newComplaint.trim() || adding}
                  loading={adding}
                >
                  {adding ? 'Adding complaint…' : 'Add complaint'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {pendingDeleteId && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-heading"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setPendingDeleteId(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-heading" className="t-h2 mb-3">
                Delete this complaint?
              </h2>
              <p className="text-gray-600 mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setPendingDeleteId(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={confirmDelete}
                  disabled={deleting}
                  loading={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="text-center py-14 text-gray-500 bg-gray-50 rounded-2xl p-10 border-4 border-dashed border-gray-300">
              <FileText className="w-14 h-14 mx-auto mb-6 opacity-40" />
              <h3 className="t-h2 mb-2">No complaints yet</h3>
              <p className="text-sm">Click &ldquo;Add new complaint&rdquo; to get started.</p>
            </div>
          ) : (
            complaints.map((complaint) => {
              const preview =
                complaint.complaint.length > 60
                  ? `${complaint.complaint.slice(0, 60)}…`
                  : complaint.complaint;
              const isActive = complaintId === complaint.id.toString();
              return (
                <Link
                  key={complaint.id}
                  to={`/admin/complaints/${complaint.id}`}
                  className={`group relative block p-5 rounded-2xl transition-all duration-200 border-2 ${
                    isActive
                      ? 'bg-brand-50 border-brand-500 shadow-brand'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/40 bg-white hover:shadow-brand'
                  } dark:bg-deep-800 dark:border-deep-700 dark:hover:border-brand-500`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 truncate mb-1.5">
                        {preview}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                        {complaint.complaint}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(complaint.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Delete complaint"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPendingDeleteId(complaint.id);
                      }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      title="Delete complaint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              );
            })
          )}
        </div>
    </div>
  );
}
