import React, { useState, useEffect, useRef } from 'react';

const MatchPredictionModal = ({ match, onClose, onSubmit, players, isEditing, initialPrediction }) => {
  const [winningTeam, setWinningTeam] = useState('');
  const [potm, setPotm] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  
  const teamDropdownRef = useRef(null);
  const playerDropdownRef = useRef(null);

  useEffect(() => {
    if (isEditing && initialPrediction) {
      setWinningTeam(initialPrediction.winningTeam);
      setPotm(initialPrediction.potm);
    }
  }, [isEditing, initialPrediction]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
        setShowTeamDropdown(false);
      }
      if (playerDropdownRef.current && !playerDropdownRef.current.contains(event.target)) {
        setShowPlayerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (winningTeam && potm) {
      onSubmit(winningTeam, potm);
    }
  };
  
  const teamPlayers = players.filter(player => 
    player.team === match.team1 || player.team === match.team2
  );

  const CustomDropdown = ({ 
    value, 
    options, 
    placeholder, 
    onSelect, 
    isOpen, 
    setIsOpen, 
    dropdownRef,
    renderOption 
  }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {renderOption ? renderOption(option) : option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
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
            <CustomDropdown
              value={winningTeam}
              options={[match.team1, match.team2]}
              placeholder="-- Select Team --"
              onSelect={setWinningTeam}
              isOpen={showTeamDropdown}
              setIsOpen={setShowTeamDropdown}
              dropdownRef={teamDropdownRef}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Player of the Match
            </label>
            <CustomDropdown
              value={potm}
              options={teamPlayers}
              placeholder="-- Select Player --"
              onSelect={(player) => setPotm(typeof player === 'string' ? player : `${player.name} (${player.team})`)}
              isOpen={showPlayerDropdown}
              setIsOpen={setShowPlayerDropdown}
              dropdownRef={playerDropdownRef}
              renderOption={(player) => 
                typeof player === 'string' ? player : `${player.name} (${player.team})`
              }
            />
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

