import React, { useState, useEffect } from 'react';

const SemifinalPredictionModal = ({ onClose, onSubmit, initialTeams }) => {
  const [selectedTeams, setSelectedTeams] = useState(['', '', '', '', '']);
  const allTeams = [
    { id: 'CSK' },
    { id: 'MI' },
    { id: 'RCB'},
    { id: 'SRH'},
    { id: 'KKR'},
    { id: 'DC' },
    { id: 'PBKS'},
    { id: 'RR' },
    { id: 'GT' },
    { id: 'LSG'}
  ];

  useEffect(() => {
    if (initialTeams && initialTeams.filter(team => team !== '').length > 0) {
      setSelectedTeams(initialTeams);
    }
  }, [initialTeams]);

  const handleTeamChange = (index, teamId) => {
    const newSelectedTeams = [...selectedTeams];
    newSelectedTeams[index] = teamId;
    setSelectedTeams(newSelectedTeams);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTeams.every(team => team !== '')) {
      onSubmit(selectedTeams);
    }
  };

  const getAvailableTeams = (currentIndex) => {
    return allTeams.filter(team => !selectedTeams.includes(team.id) || selectedTeams[currentIndex] === team.id);
  };

  const isEditing = initialTeams && initialTeams.filter(team => team !== '').length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen flex flex-col">
        <div className="bg-indigo-700 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Edit Semifinal Team Predictions" : "Semifinal Team Predictions"}
          </h3>
          <p className="text-sm">
            Select 5 teams you predict will make it to the semifinals
          </p>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          <form onSubmit={handleSubmit}>
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Team {index + 1}
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedTeams[index]}
                  onChange={(e) => handleTeamChange(index, e.target.value)}
                  required
                >
                  <option value="">-- Select Team --</option>
                  {getAvailableTeams(index).map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.id}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300"
              disabled={!selectedTeams.every(team => team !== '')}
            >
              {isEditing ? "Update Prediction" : "Submit Prediction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemifinalPredictionModal;