import React from 'react';

const WeekPointsModal = ({ 
  isOpen, 
  onClose, 
  weekPoints, 
  leaderboardData, 
  onResetWeekPoints,
  onBonusPoints,
  onDeductPoints,
  isAdmin = false 
}) => {
  if (!isOpen) return null;

  const sortedWeekPointsData = [...leaderboardData].sort((a, b) => 
    (weekPoints[b.id] || 0) - (weekPoints[a.id] || 0)
  );

  // Find users with highest and lowest week points
  const findExtremeCases = () => {
    const maxWeekPoints = Math.max(...sortedWeekPointsData.map(entry => weekPoints[entry.id] || 0));
    const minWeekPoints = Math.min(...sortedWeekPointsData.map(entry => weekPoints[entry.id] || 0));

    const highestPointUsers = sortedWeekPointsData.filter(
      entry => (weekPoints[entry.id] || 0) === maxWeekPoints
    );

    const lowestPointUsers = sortedWeekPointsData.filter(
      entry => (weekPoints[entry.id] || 0) === minWeekPoints
    );

    return { highestPointUsers, lowestPointUsers };
  };

  const { highestPointUsers, lowestPointUsers } = findExtremeCases();

  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset week points for all users?');
    if (confirmReset) {
      onResetWeekPoints();
      onClose();
    }
  };

  const handleBonusPoints = () => {
    const userNames = highestPointUsers.map(user => user.username).join(', ');
    const confirmBonus = window.confirm(`Do you want to give 2 bonus points to ${userNames}?`);
    if (confirmBonus) {
      highestPointUsers.forEach(user => onBonusPoints(user.id));
      onClose();
    }
  };

  const handleDeductPoints = () => {
    const userNames = lowestPointUsers.map(user => user.username).join(', ');
    const confirmDeduct = window.confirm(`Do you want to deduct 2 points from ${userNames}?`);
    if (confirmDeduct) {
      lowestPointUsers.forEach(user => onDeductPoints(user.id));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      ></div>

      <div className="bg-white text-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 z-10 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Week Points</h2>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                {/* Bonus button for highest point users */}
                {highestPointUsers.length > 0 && (
                  <button
                    onClick={handleBonusPoints}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600"
                  >
                    Bonus +2
                  </button>
                )}
                {/* Deduct button for lowest point users */}
                {lowestPointUsers.length > 0 && (
                  <button
                    onClick={handleDeductPoints}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600"
                  >
                    Deduct -2
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600"
                >
                  Reset
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedWeekPointsData.map((entry, index) => {
                const weekPoint = weekPoints[entry.id] || 0;
                
                return (
                  <tr key={entry.id}>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {entry.username}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {weekPoint}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeekPointsModal;