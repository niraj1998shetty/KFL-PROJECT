import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MatchResultsTable from '../components/MatchResultsTable';
import { fetchIPL2025Results } from '../services/matchResultsService';

const MatchResultsPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [is2026Open, setIs2026Open] = useState(true);
  const [is2025Open, setIs2025Open] = useState(false);
  const [search2026, setSearch2026] = useState('');
  const [search2025, setSearch2025] = useState('');

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

  // Filter function for search
  const filterMatches = (matchList, searchQuery) => {
    if (!searchQuery.trim()) return matchList;
    
    const query = searchQuery.toLowerCase();
    return matchList.filter(match => {
      const matchNo = match.matchNo?.toString().toLowerCase() || '';
      const team1 = match.team1?.toLowerCase() || '';
      const team2 = match.team2?.toLowerCase() || '';
      const venue = match.venue?.toLowerCase() || '';
      const result = match.result?.toLowerCase() || '';
      const manOfTheMatch = match.manOfTheMatch?.toLowerCase() || '';
      const date = match.date?.toLowerCase() || '';
      
      return (
        matchNo.includes(query) ||
        team1.includes(query) ||
        team2.includes(query) ||
        venue.includes(query) ||
        result.includes(query) ||
        manOfTheMatch.includes(query) ||
        date.includes(query)
      );
    });
  };

  // Separate matches by year
  const matches2026Raw = matches.filter(match => {
    const year = new Date(match.date).getFullYear();
    return year === 2026;
  });

  const matches2025Raw = matches.filter(match => {
    const year = new Date(match.date).getFullYear();
    return year === 2025;
  });

  // Apply search filters
  const matches2026 = filterMatches(matches2026Raw, search2026);
  const matches2025 = filterMatches(matches2025Raw, search2025);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* IPL 2026 Section */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setIs2026Open(!is2026Open)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">IPL 2026</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {matches2026.length} {matches2026.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            {is2026Open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {is2026Open && (
            <div className="p-4">
              <MatchResultsTable
                matches={matches2026}
                loading={loading}
                error={error}
                year="2026"
                searchValue={search2026}
                onSearchChange={setSearch2026}
              />
            </div>
          )}
        </div>
      </div>

      {/* IPL 2025 Section */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setIs2025Open(!is2025Open)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">IPL 2025</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {matches2025.length} {matches2025.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            {is2025Open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {is2025Open && (
            <div className="p-4">
              <MatchResultsTable
                matches={matches2025}
                loading={loading}
                error={error}
                year="2025"
                searchValue={search2025}
                onSearchChange={setSearch2025}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResultsPage;
