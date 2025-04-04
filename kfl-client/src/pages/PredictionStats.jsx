import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

const PredictionStats = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedMatches, setCompletedMatches] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get all users
      const usersRes = await axios.get(`${API_URL}/auth/allUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get all matches
      const matchesRes = await axios.get(`${API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter completed matches
      const completedMatchesArray = matchesRes.data.filter(match => match.result.completed);
      setCompletedMatches(completedMatchesArray.length);
      
      // Get leaderboard data which has accurate prediction counts
      const leaderboardRes = await axios.get(`${API_URL}/predictions/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map user data with leaderboard data
      const statsData = usersRes.data.map(user => {
        // Find this user in the leaderboard data
        const leaderboardEntry = leaderboardRes.data.find(entry => entry._id === user._id);
        
        if (leaderboardEntry) {
          // Calculate accuracy based on completed matches instead of total predictions
          const accuracy = completedMatchesArray.length > 0 
            ? (leaderboardEntry.correctPredictions * 100) / completedMatchesArray.length 
            : 0;
            
          return {
            id: user._id,
            name: user.name,
            totalPoints: user.points,
            predictionsCount: leaderboardEntry.totalPredictions,
            correctPredictions: leaderboardEntry.correctPredictions,
            accuracy: accuracy.toFixed(1)
          };
        } else {
          // User hasn't made any predictions yet
          return {
            id: user._id,
            name: user.name,
            totalPoints: user.points,
            predictionsCount: 0,
            correctPredictions: 0,
            accuracy: "0.0"
          };
        }
      });
      
      // Sort by total points (descending)
      const sortedStatsData = statsData.sort((a, b) => b.totalPoints - a.totalPoints);
      
      setStatsData(sortedStatsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats data:", error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-grow bg-gray-100 py-8 min-h-[80vh] mt-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <div className="mb-4">
            <button
              onClick={handleBack}
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
                Statistics
              </h1>
              <div className="text-sm text-white">
                Total Matches: {completedMatches}
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
                      <tr className="sticky top-0 bg-gray-50 shadow-sm">
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Accuracy
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <div className="overflow-y-auto flex-grow">
                  <table className="w-full">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statsData.length > 0 ? (
                        statsData.map((user, index) => {
                          const isInTop3 = index < 3;
                          return (
                            <tr
                              key={user.id}
                              className={isInTop3 ? "bg-blue-50" : ""}
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.totalPoints}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-gray-900">
                                  {user.correctPredictions}/{completedMatches} ({user.accuracy}%)
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 sm:px-6 py-8 text-center text-gray-500"
                          >
                            No statistics data available
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
    </div>
  );
};

export default PredictionStats;