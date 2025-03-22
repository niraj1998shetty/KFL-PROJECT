import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [updateError, setUpdateError] = useState('');
  const [formData, setFormData] = useState({
    matchNumber: '',
    matchType: 'league',
    winner: '',
    manOfTheMatch: '',
    winningType: '',
  });

  useEffect(() => {
    // Fetch leaderboard data
    fetchLeaderboardData();
    // Fetch teams and players data
    fetchTeamsAndPlayers();
  }, []);

  const fetchLeaderboardData = async () => {
    // Mock data for now - will be replaced with API call
    const mockData = [
      { id: 1, username: 'JohnDoe', totalPoints: 75 },
      { id: 2, username: 'JaneSmith', totalPoints: 91 },
      { id: 3, username: 'MikeJohnson', totalPoints: 91 },
      { id: 4, username: 'SarahWilliams', totalPoints: 91 },
      { id: 5, username: 'DavidBrown', totalPoints: 75 },
      { id: 6, username: 'AlexTaylor', totalPoints: 82 },
      { id: 7, username: 'EmmaClark', totalPoints: 82 },
      { id: 8, username: 'ChrisWilson', totalPoints: 63 },
      { id: 9, username: 'OliviaJones', totalPoints: 63 },
      { id: 10, username: 'RobertMiller', totalPoints: 60 },
    ];
    
    // Sort by total points in descending order
    const sortedData = mockData.sort((a, b) => b.totalPoints - a.totalPoints);
    setLeaderboardData(sortedData);
  };

  const fetchTeamsAndPlayers = async () => {
    // Mock data for now - will be replaced with API call
    const mockTeams = [
      { id: 1, name: 'India' },
      { id: 2, name: 'Australia' },
      { id: 3, name: 'England' },
      { id: 4, name: 'South Africa' },
      { id: 5, name: 'New Zealand' },
    ];
    
    const mockPlayers = [
      { id: 1, name: 'Virat Kohli', teamId: 1 },
      { id: 2, name: 'Rohit Sharma', teamId: 1 },
      { id: 3, name: 'Steve Smith', teamId: 2 },
      { id: 4, name: 'Pat Cummins', teamId: 2 },
      { id: 5, name: 'Joe Root', teamId: 3 },
      { id: 6, name: 'Ben Stokes', teamId: 3 },
      { id: 7, name: 'Kagiso Rabada', teamId: 4 },
      { id: 8, name: 'Quinton de Kock', teamId: 4 },
      { id: 9, name: 'Kane Williamson', teamId: 5 },
      { id: 10, name: 'Trent Boult', teamId: 5 },
    ];
    
    setTeams(mockTeams);
    setPlayers(mockPlayers);
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setUpdateError('');
    setFormData({
      matchNumber: '',
      matchType: 'league',
      winner: '',
      manOfTheMatch: '',
      winningType: '',
    });
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Reset winner and man of the match when match number changes
    if (name === 'matchNumber') {
      setFormData({
        ...formData,
        matchNumber: value,
        winner: '',
        manOfTheMatch: '',
      });
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getTeamsForMatch = (matchNumber) => {
    // In a real app, this would fetch the teams playing in the specific match
    // For now returning mock data
    if (!matchNumber) return [];
    
    // Just returning the first two teams as an example
    return teams.slice(0, 2);
  };

  const getPlayersForTeams = (teamId) => {
    if (!teamId) return [];
    return players.filter(player => player.teamId === parseInt(teamId));
  };

  // Modified function to handle ties
  const getRankMedal = (index, entry) => {
    // Determine the actual rank based on points (not index)
    let rank = 1; // Start with rank 1
    
    // Count how many users have more points than the current user
    for (let i = 0; i < leaderboardData.length; i++) {
      if (leaderboardData[i].totalPoints > entry.totalPoints) {
        rank++;
      }
    }
    
    // Assign medals based on actual rank
    if (rank === 1) return "🥇"; // Gold
    if (rank === 2) return "🥈"; // Silver
    if (rank === 3) return "🥉"; // Bronze
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.matchNumber || !formData.winner || !formData.manOfTheMatch) {
      setUpdateError('Please fill in all required fields');
      return;
    }

    // Check if result for this match has already been updated
    // This would be an API call in a real app
    const matchExists = false; // Mock check
    
    if (matchExists) {
      setUpdateError('Result for this match has already been updated');
      return;
    }

    // Process form data and update points
    try {
      // Mock API call to update results
      console.log('Submitting result update:', formData);
      
      // In a real app, this would be an API call to update points
      // For now, just show success and close modal
      alert('Match result updated successfully!');
      closeUpdateModal();
      fetchLeaderboardData(); // Refresh leaderboard data
    } catch (error) {
      setUpdateError('Failed to update result. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard'); // Navigate to dashboard page
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      
      <main className="flex-grow bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <div className="mb-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 sm:p-6 bg-blue-600 text-white flex flex-wrap sm:flex-row justify-between items-center gap-3">
              <h1 className="text-lg sm:text-xl font-semibold">Points Standings</h1>
              {user && user.isAdmin && (
                <button
                  onClick={openUpdateModal}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-gray-100 transition duration-300 text-sm"
                >
                  Update Result
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.map((entry, index) => {
                    // Determine if user is in top 3 ranks based on points
                    const prevPoints = index > 0 ? leaderboardData[index - 1].totalPoints : null;
                    let rank = index + 1;
                    
                    // If current user has same points as previous user, they share the same rank
                    if (prevPoints === entry.totalPoints) {
                      rank = index; // Use the index of the previous user with the same points
                    }
                    
                    const isInTop3 = rank <= 3;
                    
                    return (
                      <tr 
                        key={entry.id}
                        className={isInTop3 ? "bg-blue-50" : ""}
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <span className="mr-1">{rank}</span>
                            <span className="text-lg">{getRankMedal(index, entry)}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                            {entry.username}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.totalPoints}
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
      </main>

      <Footer />

      {/* Update Result Modal with Fixed Header and Scrollable Content */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeUpdateModal}
          ></div>

          <div className="bg-white text-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 z-10 max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Update Match Result</h2>
                <button
                  onClick={closeUpdateModal}
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

              {updateError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {updateError}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Match Number*
                  </label>
                  <input
                    type="number"
                    name="matchNumber"
                    value={formData.matchNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Match Type*
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="matchType"
                        value="league"
                        checked={formData.matchType === "league"}
                        onChange={handleRadioChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">League Match</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="matchType"
                        value="semifinal"
                        checked={formData.matchType === "semifinal"}
                        onChange={handleRadioChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Semifinal</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="matchType"
                        value="final"
                        checked={formData.matchType === "final"}
                        onChange={handleRadioChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Final</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Winner*
                  </label>
                  <select
                    name="winner"
                    value={formData.winner}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Winner</option>
                    {getTeamsForMatch(formData.matchNumber).map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Man of the Match*
                  </label>
                  <select
                    name="manOfTheMatch"
                    value={formData.manOfTheMatch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Player</option>
                    {formData.winner && 
                      getPlayersForTeams(formData.winner).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Winning Type
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="winningType"
                        value="10wickets"
                        checked={formData.winningType === "10wickets"}
                        onChange={handleRadioChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Won by 10 wickets</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="winningType"
                        value="100runs"
                        checked={formData.winningType === "100runs"}
                        onChange={handleRadioChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Won by 100+ runs</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeUpdateModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;