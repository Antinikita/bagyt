import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sanctumRequest } from '../config/sanctumRequest';

export default function ComplaintsList() {
  const { complaintId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // ✅ Gets YOUR user's complaints only (user_id matches)
      const response = await sanctumRequest('get', '/complaints');
      const mappedComplaints = (response.data || []).map(complaint => ({
        id: complaint.id,
        complaint: complaint.complaint,        // ✅ Your exact field
        created_at: complaint.created_at,      // ✅ Your timestamps
        user_id: complaint.user_id             // ✅ Your foreign key
      }));
      setComplaints(mappedComplaints);
    } catch (error) {
      console.error('Fetch complaints failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async () => {
    if (!newComplaint.trim()) return;
    
    try {
      setAdding(true);
      // ✅ Sends to backend → auto-sets user_id from Auth::user()
      await sanctumRequest('post', '/complaints', { 
        complaint: newComplaint.trim() 
      });
      setNewComplaint('');
      setShowAddModal(false);
      fetchComplaints(); // ✅ Refreshes YOUR complaints only
    } catch (error) {
      alert('Add failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setAdding(false);
    }
  };

  const deleteComplaint = async (id) => {
    if (confirm('Delete this complaint permanently?')) {
      try {
        // ✅ Backend checks user_id ownership before delete
        await sanctumRequest('delete', `/complaints/${id}`);
        fetchComplaints();
      } catch (error) {
        alert('Delete failed: ' + (error.response?.data?.message || error.message));
      }
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* ADD BUTTON */}
        <button
          onClick={() => setShowAddModal(true)}
          disabled={adding}
          className="block w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 text-lg font-semibold"
        >
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {adding ? 'Adding Complaint...' : 'Add New Complaint'}
          </div>
        </button>

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <h2 className="text-3xl font-bold text-gray-900">New Complaint</h2>
                <p className="text-gray-600 mt-2">Describe your issue in detail</p>
              </div>
              
              <div className="p-8">
                <textarea
                  rows={8}
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Please describe your complaint in as much detail as possible..."
                  className="w-full p-6 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent resize-none text-lg leading-relaxed"
                  disabled={adding}
                  maxLength={10000}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {newComplaint.length}/10000 characters
                </div>
              </div>
              
              <div className="p-8 border-t border-gray-200 bg-gray-50 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  onClick={addComplaint}
                  disabled={!newComplaint.trim() || adding}
                  className="flex-1 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-3"
                >
                  {adding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding Complaint...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS LIST */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-3xl p-12 border-4 border-dashed border-gray-200">
              <svg className="w-24 h-24 mx-auto mb-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No complaints yet</h3>
              <p className="text-lg">Click "Add New Complaint" to get started</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/admin/complaints/${complaint.id}`}
                className={`group relative block p-8 rounded-3xl transition-all duration-300 border-4 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 ${
                  complaintId === complaint.id.toString() 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-2xl ring-4 ring-blue-200/50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 truncate mb-3 leading-tight">
                      {complaint.complaint.substring(0, 60)}...
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {complaint.complaint}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(complaint.created_at).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
                
                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteComplaint(complaint.id);
                  }}
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 rounded-2xl hover:bg-red-500 hover:text-white hover:shadow-2xl hover:scale-110 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 hover:border-red-300"
                  title="Delete complaint"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
