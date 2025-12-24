import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MatchResultsTable from '../components/MatchResultsTable';
import { fetchIPL2025Results } from '../services/matchResultsService';

const MatchResultsPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMatchResults();
  }, []);

  const loadMatchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIPL2025Results();
      setMatches(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch match results. Please try again.');
      setMatches([]);
      console.error('Error loading match results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Go back"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              IPL 2025 Match Results
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              View all completed IPL 2025 matches
            </p>
          </div>
        </div>
      </div>

      {/* Match Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <MatchResultsTable
          matches={matches}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default MatchResultsPage;
