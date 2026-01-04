import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name}!
        </h1>
        
        <p className="text-gray-600 mb-6">
          This is your dashboard. You can manage your complaints from here.
        </p>

        <Link
          to="/complaints"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          View My Complaints
        </Link>
      </div>
    </div>
  );
}