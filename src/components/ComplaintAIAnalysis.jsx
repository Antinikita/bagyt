import { useState, useEffect } from 'react';
import axiosClient from '../api/axios-client'; // replace sanctumRequest import

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

      const { data } = await axiosClient.post('/complaints/analyze', { // replace sanctumRequest
        complaint_id: complaint.id
      });

      setResult({
        ...data,
        is_cached: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze complaint');
    } finally {
      setAnalyzing(false);
    }
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

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{result ? 'Re-analyze with AI' : 'Analyze with AI'}</span>
            </>
          )}
        </button>

        {result?.saved_at && (
          <span className="text-xs text-gray-500">
            {result.is_cached ? 'Saved' : 'Last analyzed'}: {formatDate(result.saved_at)}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && result.reply && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Recommendation
            </h3>

            {result.is_cached && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                Saved
              </span>
            )}
          </div>
          
          <div className="text-gray-900 bg-white p-4 rounded-lg whitespace-pre-wrap leading-relaxed shadow-sm">
            {result.reply}
          </div>

          {result.recommendation_id && !result.is_cached && (
            <p className="mt-3 text-sm text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Recommendation saved successfully
            </p>
          )}

          {/* Опциональные метаданные */}
          {result.sentiment && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Sentiment:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.sentiment}
              </span>
            </div>
          )}

          {result.category && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {result.category}
              </span>
            </div>
          )}

          {result.priority && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                result.priority === 'high' ? 'bg-red-100 text-red-800' :
                result.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {result.priority}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}