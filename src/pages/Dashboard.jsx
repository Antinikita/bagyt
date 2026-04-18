import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-grad-cta-deep text-white rounded-2xl shadow-xl p-8">
        <p className="t-section text-white/70 mb-3">Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-white/80 max-w-lg">
          Track your complaints and get AI-assisted recommendations in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/admin/complaints/new">
            <Button variant="primary">
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New complaint
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 dark:bg-deep-800 dark:border-deep-700">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="t-h3">How it works</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Open a complaint from the sidebar, describe your symptoms, and use
              &ldquo;Analyze with AI&rdquo; for a recommendation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
