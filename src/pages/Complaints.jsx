import { useState, useEffect } from 'react';
import axiosClient from '../api/axios-client';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComplaint, setNewComplaint] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/complaints');
      setComplaints(response.data.complaints);
      setError(null);
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newComplaint.trim()) return;

    try {
      setSubmitting(true);
      await axiosClient.get('/sanctum/csrf-cookie');
      const response = await axiosClient.post('/complaints', {
        complaint: newComplaint
      });
      setComplaints([response.data.complaint, ...complaints]);
      setNewComplaint('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editText.trim()) return;

    try {
      const response = await axiosClient.put(`/complaints/${id}`, {
        complaint: editText
      });
      setComplaints(complaints.map(c => 
        c.id === id ? response.data.complaint : c
      ));
      setEditingId(null);
      setEditText('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await axiosClient.delete(`/complaints/${id}`);
      setComplaints(complaints.filter(c => c.id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  const startEdit = (complaint) => {
    setEditingId(complaint.id);
    setEditText(complaint.complaint);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Complaints</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Form */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">New Complaint</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <textarea
              value={newComplaint}
              onChange={(e) => setNewComplaint(e.target.value)}
              placeholder="Describe your complaint..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="1000"
              required
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {newComplaint.length}/1000 characters
              </span>
              
              <button
                type="submit"
                disabled={submitting || !newComplaint.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Complaints List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All Complaints ({complaints.length})
          </h2>
          
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg">No complaints yet</p>
              <p className="text-sm mt-2">Create your first complaint above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {editingId === complaint.id ? (
                    // Edit Mode
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="4"
                        maxLength="1000"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdate(complaint.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs text-gray-500">{formatDate(complaint.created_at)}</span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(complaint)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleDelete(complaint.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 whitespace-pre-wrap">{complaint.complaint}</p>
                      
                      {complaint.updated_at !== complaint.created_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Updated: {formatDate(complaint.updated_at)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}