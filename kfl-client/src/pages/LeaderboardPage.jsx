import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import TopBar from '../components/TopBar';
import WeekPointsModal from '../components/WeekPointsModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

  const LeaderboardPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [weekPoints, setWeekPoints] = useState({});
    const [loading, setLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isWeekPointsModalOpen, setIsWeekPointsModalOpen] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [userPredictions, setUserPredictions] = useState([]);
    const [processingUpdate, setProcessingUpdate] = useState(false);
    const [formData, setFormData] = useState({
      matchNumber: '',
      matchType: 'league',
      winner: '',
      manOfTheMatch: '',
      winningType: '',
    });
  
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
    useEffect(() => {
      fetchLeaderboardData();
      fetchAllMatches();
    }, []);
  
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/allUsers`);
        
        const transformedData = res.data.map((user) => ({
          id: user._id,
          username: user.name,
          totalPoints: user.points,
          weekPoints: user.weekPoints,
          mobile: user.mobile,
        }));
        
        const sortedData = transformedData.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaderboardData(sortedData);
  
        // Create week points object
        const weekPointsObj = transformedData.reduce((acc, user) => {
          acc[user.id] = user.weekPoints || 0;
          return acc;
        }, {});
        setWeekPoints(weekPointsObj);
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users for leaderboard:", error);
        setLoading(false);
      }
    };

  const fetchAllMatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const sortedMatches = res.data.sort((a, b) => a.matchNumber - b.matchNumber);
      setMatches(sortedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const fetchMatchById = async (matchId) => {
    try {
      setMatchLoading(true);
      const res = await axios.get(`${API_URL}/matches/${matchId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedMatch(res.data);
      
      await fetchPredictionsForMatch(matchId);
      
      await fetchPlayersForTeams([res.data.team1, res.data.team2]);
      
      setMatchLoading(false);
    } catch (error) {
      console.error("Error fetching match details:", error);
      setMatchLoading(false);
      setUpdateError("Error loading match details. Please try again.");
    }
  };

  const fetchPredictionsForMatch = async (matchId) => {
    try {
      const res = await axios.get(`${API_URL}/predictions/match/${matchId}/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserPredictions(res.data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const fetchPlayersForTeams = async (teamCodes) => {
    try {
      const playerPromises = teamCodes.map(teamCode => 
        axios.get(`${API_URL}/players/team/${teamCode}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      );
      
      const responses = await Promise.all(playerPromises);
      
      const allPlayers = responses.flatMap(response => response.data);
      setPlayers(allPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      setUpdateError("Error loading player data. Please try again.");
    }
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
    setUpdateError('');
    setUpdateSuccess('');
    setSelectedMatch(null);
    setPlayers([]);
    setUserPredictions([]);
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
    
    if (name === 'matchNumber') {
      setFormData({
        ...formData,
        matchNumber: value,
        winner: '',
        manOfTheMatch: '',
      });
      
      const matchToSelect = matches.find(match => match.matchNumber === parseInt(value));
      
      if (matchToSelect) {
        fetchMatchById(matchToSelect._id);
      } else {
        setSelectedMatch(null);
        setPlayers([]);
        setUserPredictions([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
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

  const getRankMedal = (index, entry) => {
    let rank = 1; // Start with rank 1
  
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

  const handleBonusPoints = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/users/admin/addPoints/${userId}/2`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refetch leaderboard to update points
      await fetchLeaderboardData();
    } catch (error) {
      console.error(`Error adding bonus points for user ${userId}:`, error);
      // Optionally, show an error message to the user
    }
  };
  
  const handleDeductPoints = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/users/admin/addPoints/${userId}/-2`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refetch leaderboard to update points
      await fetchLeaderboardData();
    } catch (error) {
      console.error(`Error deducting points for user ${userId}:`, error);
      // Optionally, show an error message to the user
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.matchNumber || !formData.winner || !formData.manOfTheMatch) {
      setUpdateError('Please fill in all required fields');
      return;
    }
  
    if (!selectedMatch) {
      setUpdateError('Please select a valid match number');
      return;
    }
  
    setProcessingUpdate(true);
    setUpdateError('');
    setUpdateSuccess('');
  
    try {
      await axios.put(
        `${API_URL}/matches/${selectedMatch._id}/result`,
        {
          winner: formData.winner,
          playerOfTheMatch: formData.manOfTheMatch
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const selectedPlayerName = players.find(
        player => player._id === formData.manOfTheMatch
      )?.name;
      
      if (userPredictions.length > 0) {
        const updatePromises = userPredictions.map(async prediction => {
          const correctTeam = prediction.predictedWinner === formData.winner;
          
          const correctMOM = 
            prediction.playerOfTheMatch === formData.manOfTheMatch || 
            prediction.playerOfTheMatch === selectedPlayerName; 
          
          let pointsToAward = 0;
          if (formData.matchType === 'league') {
            if (correctTeam) pointsToAward += 5;
            if (correctMOM) pointsToAward += 4;
          } else if (formData.matchType === 'semifinal') {
            if (correctTeam) pointsToAward += 7;
            if (correctMOM) pointsToAward += 5;
          } else if (formData.matchType === 'final') {
            if (correctTeam) pointsToAward += 10;
            if (correctMOM) pointsToAward += 7;
          }
          
          if (correctTeam && (formData.winningType === '10wickets' || formData.winningType === '100runs')) {
            pointsToAward += 2;
          }
          
          if (pointsToAward > 0) {
            await axios.put(
                         `${API_URL}/users/admin/addPoints/${prediction.user._id}/${pointsToAward}`,
                         {},
                         {
                           headers: {
                             Authorization: `Bearer ${localStorage.getItem('token')}`
                           }
                         }
                       );
           
                       // Update week points
                       await axios.put(
                         `${API_URL}/users/weekPoints/add/${prediction.user._id}/${pointsToAward}`,
                         {},
                         {
                           headers: {
                             Authorization: `Bearer ${localStorage.getItem('token')}`
                           }
                         }
                       );
          }
          return Promise.resolve();
        });
        
        await Promise.all(updatePromises);
      }
      
      setUpdateSuccess('Match result updated and user points calculated successfully!');
      
      await fetchLeaderboardData();
      
      setTimeout(() => {
        closeUpdateModal();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating match result:", error);
      setUpdateError('Failed to update result. Please try again.');
    } finally {
      setProcessingUpdate(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard'); 
      };
      
      const handleResetWeekPoints = async () => {
         try {
              await axios.put(`${API_URL}/users/weekPoints/reset`, {}, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
        
              // Reset local state
              const resetWeekPoints = leaderboardData.reduce((acc, user) => {
                acc[user.id] = 0;
                return acc;
              }, {});
        
              setWeekPoints(resetWeekPoints);
        
              // Refetch leaderboard to ensure updated data
              fetchLeaderboardData();
            } catch (error) {
              console.error("Error resetting week points:", error);
            }
      };
    
      const openWeekPointsModal = () => {
        setIsWeekPointsModalOpen(true);
      };
    
      // const closeWeekPointsModal = () => {
      //   setIsWeekPointsModalOpen(false);
      // };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-grow bg-gray-100 py-8 min-h-[80vh]">
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
              Back
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden h-[65vh] flex flex-col">
            <div className="p-4 sm:p-6 bg-blue-600 text-white flex flex-wrap sm:flex-row justify-between items-center gap-3">
              <h1 className="text-base sm:text-lg font-semibold">
                Leader Board
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={openWeekPointsModal}
                  className="bg-white text-blue-600 px-2 py-1 rounded-md font-medium hover:bg-gray-100 transition duration-300 text-xs sm:text-sm"
                >
                  Week's leaderboard
                </button>

                {currentUser && currentUser.isAdmin && (
                  <button
                    onClick={openUpdateModal}
                    className="bg-white text-blue-600 px-2 py-1 rounded-md font-medium hover:bg-gray-100 transition duration-300 text-xs sm:text-sm"
                  >
                    Result
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8 flex-grow">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
              </div>
            ) : (
              <div className="flex flex-col flex-grow overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <div className="overflow-y-auto flex-grow">
                  <table className="w-full">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboardData.length > 0 ? (
                        leaderboardData.map((entry, index) => {
                          let rank = 1;
                          for (let i = 0; i < index; i++) {
                            if (
                              leaderboardData[i].totalPoints > entry.totalPoints
                            ) {
                              rank++;
                            }
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
                                  <span className="text-lg">
                                    {getRankMedal(index, entry)}
                                  </span>
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
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 sm:px-6 py-8 text-center text-gray-500"
                          >
                            No user data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      {/* Week Points Modal */}
      <WeekPointsModal
        isOpen={isWeekPointsModalOpen}
        onClose={() => setIsWeekPointsModalOpen(false)}
        weekPoints={weekPoints}
        leaderboardData={leaderboardData}
        onResetWeekPoints={handleResetWeekPoints}
        onBonusPoints={handleBonusPoints}
        onDeductPoints={handleDeductPoints}
        isAdmin={currentUser && currentUser.isAdmin}
      />
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeUpdateModal}
          ></div>

          <div className="bg-white text-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 z-10 max-h-[90vh] flex flex-col">
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

              {updateSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {updateSuccess}
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
                  <select
                    name="matchNumber"
                    value={formData.matchNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Match Number</option>
                    {matches
                      .filter(
                        (match) => !match.result || !match.result.completed
                      ) // Filter out completed matches
                      .map((match) => (
                        <option key={match._id} value={match.matchNumber}>
                          Match {match.matchNumber}: {match.team1} vs{" "}
                          {match.team2} - {match.date}
                        </option>
                      ))}
                  </select>
                </div>

                {matchLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                  </div>
                ) : (
                  selectedMatch && (
                    <>
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
                            <span className="ml-2 text-gray-700">
                              League Match
                            </span>
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
                            <span className="ml-2 text-gray-700">
                              Semifinal
                            </span>
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
                          <option value={selectedMatch.team1}>
                            {selectedMatch.team1}
                          </option>
                          <option value={selectedMatch.team2}>
                            {selectedMatch.team2}
                          </option>
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
                          {players.map((player) => (
                            <option key={player._id} value={player._id}>
                              {player.name} ({player.team})
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
                            <span className="ml-2 text-gray-700">
                              Won by 10 wickets
                            </span>
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
                            <span className="ml-2 text-gray-700">
                              Won by 100+ runs
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="winningType"
                              value="none"
                              checked={
                                formData.winningType === "none" ||
                                formData.winningType === ""
                              }
                              onChange={handleRadioChange}
                              className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">None</span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Selecting a winning type will award 2 bonus points to
                          users who correctly predicted the winning team.
                        </p>
                      </div>
                    </>
                  )
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeUpdateModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processingUpdate}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !selectedMatch || matchLoading || processingUpdate
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !selectedMatch || matchLoading || processingUpdate
                    }
                  >
                    {processingUpdate ? "Processing..." : "Submit"}
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
