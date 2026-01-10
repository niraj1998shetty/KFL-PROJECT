import React from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const MatchResultsTable = ({ matches, loading, error, year, searchValue, onSearchChange }) => {
  const getHeaderColor = () => {
    return year === '2026' 
      ? 'from-blue-600 to-purple-700' 
      : 'from-indigo-600 to-purple-700';
  };

  const getFocusColor = () => {
    return year === '2026' ? 'focus:ring-blue-500' : 'focus:ring-indigo-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Loading match results for {year}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold mb-2">Failed to load match results</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by match no, teams, venue, player, date..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg ${getFocusColor()} focus:border-transparent transition-all text-sm md:text-base`}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* No Matches Message */}
      {(!matches || matches.length === 0) && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 md:p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="text-gray-400">
              <svg 
                className="w-16 h-16 md:w-20 md:h-20" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg md:text-xl">No matches yet</p>
            <p className="text-gray-500 text-sm md:text-base max-w-md">
              No IPL match results available for {year}. Matches will appear here once they are completed.
            </p>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      {matches && matches.length > 0 && (
        <div className="hidden md:block bg-white rounded-lg shadow-md max-h-[600px] overflow-auto">
          <table className="w-full">
            <thead>
              <tr className={`bg-gradient-to-r ${getHeaderColor()} text-white`}>
                <th className="px-4 py-3 text-left text-sm font-semibold">Match No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Team 1</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Team 2</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Venue</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Result</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Man of the Match</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr
                  key={match.id || index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {match.matchNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{match.team1}</div>
                    <div className="text-xs text-gray-500">{formatDate(match.date)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {match.team2}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {match.venue}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="max-w-xs">
                      {match.result === 'No result' ? (
                        <p className="font-medium text-gray-500 italic">No result</p>
                      ) : (
                        <p className="font-medium text-green-700">{match.result}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {match.manOfTheMatch === 'No-one' ? (
                      <span className="text-gray-400 italic text-xs">No-one</span>
                    ) : match.manOfTheMatch ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        {match.manOfTheMatch}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No-one</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {matches && matches.length > 0 && (
        <div className="md:hidden bg-white rounded-lg shadow-md p-2 max-h-[600px] overflow-y-auto">
          {matches.map((match, index) => (
            <div
              key={match.id || index}
              className="border-b border-gray-200 p-4 last:border-b-0 bg-purple-50 rounded-lg mb-3"
            >
              <div className="mb-2 flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">Match {match.matchNo}</h3>
                <span className="text-xs text-gray-500">{formatDate(match.date)}</span>
              </div>
              <div className="mb-3 bg-gray-50 p-2 rounded">
                <p className="font-medium text-center text-gray-900 mb-2">
                  {match.team1} vs {match.team2}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{match.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Result:</span>
                  <span className="font-medium text-right flex-1 ml-2">
                    {match.result === 'No result' ? (
                      <span className="text-gray-400 italic">No result</span>
                    ) : (
                      <span className="text-green-700">{match.result}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MOM:</span>
                  <span className="font-medium">
                    {match.manOfTheMatch === 'No-one' ? (
                      <span className="text-gray-400 italic">No-one</span>
                    ) : (
                      match.manOfTheMatch
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'N/A';
  }
};

export default MatchResultsTable;
