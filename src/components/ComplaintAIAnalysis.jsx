import { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { sanctumRequest } from '../config/sanctumRequest';
import { parseApiError } from '../utils/apiError';
import Button from './ui/Button';
import ErrorBanner from './ui/ErrorBanner';

export default function ComplaintAIAnalysis({ complaint }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (complaint?.latest_recommendation) {
      setResult({
        reply: complaint.latest_recommendation.recommendation,
        saved_at: complaint.latest_recommendation.created_at,
        is_cached: true,
        recommendation_id: complaint.latest_recommendation.id,
      });
    } else {
      setResult(null);
    }
    setError(null);
  }, [complaint?.id, complaint?.latest_recommendation]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await sanctumRequest('post', '/complaints/analyze', {
        complaint_id: complaint.id,
      });

      setResult({
        ...response.data,
        is_cached: false,
      });
    } catch (err) {
      setError(parseApiError(err, 'Failed to analyze complaint'));
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="mt-2 border-t border-gray-200 dark:border-deep-700 pt-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={handleAnalyze}
          disabled={analyzing}
          loading={analyzing}
        >
          <span className="inline-flex items-center gap-2">
            {!analyzing && <Sparkles className="h-4 w-4" />}
            {analyzing
              ? 'Analyzing with AI…'
              : result
                ? 'Re-analyze with AI'
                : 'Analyze with AI'}
          </span>
        </Button>

        {result?.saved_at && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {result.is_cached ? 'Saved' : 'Last analyzed'}: {formatDate(result.saved_at)}
          </span>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {result && result.reply && (
        <div className="mt-4 bg-grad-ai border border-brand-200 rounded-2xl p-6 shadow-brand dark:border-deep-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="t-h3 inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-700 dark:text-brand-300" />
              AI recommendation
            </h3>

            {result.is_cached && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                Saved
              </span>
            )}
          </div>

          <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-deep-800 p-4 rounded-xl whitespace-pre-wrap leading-relaxed shadow-sm">
            {result.reply}
          </div>

          {result.recommendation_id && !result.is_cached && (
            <p className="mt-3 text-sm text-emerald-700 inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Recommendation saved successfully.
            </p>
          )}

          {result.sentiment && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sentiment:
              </span>
              <span
                className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  result.sentiment === 'positive'
                    ? 'bg-emerald-50 text-emerald-700'
                    : result.sentiment === 'negative'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                }`}
              >
                {result.sentiment}
              </span>
            </div>
          )}

          {result.category && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category:
              </span>
              <span className="ml-2 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold">
                {result.category}
              </span>
            </div>
          )}

          {result.priority && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority:
              </span>
              <span
                className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  result.priority === 'high'
                    ? 'bg-red-50 text-red-700'
                    : result.priority === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {result.priority}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
