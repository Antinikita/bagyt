import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../api/axios-client';

export default function Sidebar() {
  const { complaintId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axiosClient.get('/api/complaints');
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id) => {
    if (confirm('Delete this complaint?')) {
      try {
        await axiosClient.delete(`/api/complaints/${id}`);
        fetchComplaints();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-gray-700 h-screen overflow-y-auto">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Admin Panel
        </h1>
      </div>

      {/* Add New Complaint */}
      <div className="p-6">
        <Link
          to="/admin/complaints/new"
          className="w-full block p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl mb-6 transform hover:-translate-y-1"
        >
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            + Add Complaint
          </div>
        </Link>
      </div>

      {/* Complaints List */}
      <div className="p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No complaints</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <Link
              key={complaint.id}
              to={`/admin/complaints/${complaint.id}`}
              className={`group relative flex p-4 rounded-2xl transition-all duration-300 border-2 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 ${
                complaintId === complaint.id.toString() 
                  ? 'bg-blue-500/20 border-blue-500 shadow-xl ring-2 ring-blue-400/50' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{complaint.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-400 mt-1 truncate">{complaint.description?.substring(0, 60)}...</p>
              </div>
              
              {/* Delete Button on Hover */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteComplaint(complaint.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/80 transition-all duration-200 ml-2 flex items-center justify-center"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
