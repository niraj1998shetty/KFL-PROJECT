import React, { useState, useEffect } from 'react';

const MatchPredictionModal = ({ match, onClose, onSubmit, players, isEditing, initialPrediction }) => {
  const [winningTeam, setWinningTeam] = useState('');
  const [potm, setPotm] = useState('');

  useEffect(() => {
    if (isEditing && initialPrediction) {
      setWinningTeam(initialPrediction.winningTeam);
      setPotm(initialPrediction.potm);
    }
  }, [isEditing, initialPrediction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (winningTeam && potm) {
      onSubmit(winningTeam, potm);
    }
  };
  
  const teamPlayers = players.filter(player => 
    player.team === match.team1 || player.team === match.team2
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Edit Prediction: ' : 'New Prediction: '}
            {match.team1} vs {match.team2}
          </h3>
          <p className="text-sm">
            {match.venue} | {match.time}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Winning Team
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={winningTeam}
              onChange={(e) => setWinningTeam(e.target.value)}
              required
            >
              <option value="">-- Select Team --</option>
              <option value={match.team1}>{match.team1}</option>
              <option value={match.team2}>{match.team2}</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Player of the Match
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={potm}
              onChange={(e) => setPotm(e.target.value)}
              required
            >
              <option value="">-- Select Player --</option>
              {teamPlayers.map(player => (
                <option key={player._id} value={player.name}>
                  {player.name} ({player.team})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${isEditing ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800'} text-white rounded shadow-sm focus:outline-none`}
            >
              {isEditing ? 'Update Prediction' : 'Submit Prediction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchPredictionModal;