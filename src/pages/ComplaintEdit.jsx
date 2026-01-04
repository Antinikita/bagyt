import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sanctumRequest } from '../config/sanctumRequest';  // ✅ Use your auth helper

export default function ComplaintEdit() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState({ complaint: '' });  // ✅ Match your DB field
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (complaintId === 'new') {
      setLoading(false);
      return;
    }
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      const response = await sanctumRequest('get', `/complaints/${complaintId}`);
      // ✅ Map your DB field to React state
      setComplaint({ complaint: response.data.complaint });
    } catch (error) {
      alert('Failed to load complaint');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (complaintId === 'new') {
        await sanctumRequest('post', '/complaints', complaint);  // ✅ web.php route
      } else {
        await sanctumRequest('put', `/complaints/${complaintId}`, complaint);  // ✅ web.php
      }
      navigate('/admin/complaints');  // ✅ Go to complaints list
    } catch (error) {
      alert('Failed to save complaint');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {complaintId === 'new' ? 'New Complaint' : 'Edit Complaint'}
          </h1>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complaint</label>
            <textarea
              rows={10}
              value={complaint.complaint}
              onChange={(e) => setComplaint({ ...complaint, complaint: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
              placeholder="Describe your complaint..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/complaints')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : complaintId === 'new' ? (
                'Create Complaint'
              ) : (
                'Update Complaint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
