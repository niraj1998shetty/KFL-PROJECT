import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";
import TopBar from "../components/TopBar";
import { getFirstName } from "../helpers/functions";

const PredictionStats = () => {
  const { currentUser } = useAuth();
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showExtraStats, setShowExtraStats] = useState(false);
  // Sorting states
  const [sortField, setSortField] = useState("totalPoints");
  const [sortDirection, setSortDirection] = useState("desc");
  
  const [extraStats, setExtraStats] = useState({
    highestWeeklyScore: "Sagar, Samiksha, Adesh (34)",
    lowestWeeklyScore: "Anusha (5)",
    consecutiveWrongPrediction: "Anusha (12 matches)",
    consecutiveRightPrediction: "Akhilesh (7 matches)",
    highestPlusPoints: "Sagar, Sameeksha, Adesh, Aadi",
    highestMinusPoints: "Anusha (2 times)",
  });
  const [editableStats, setEditableStats] = useState({...extraStats});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the new optimized endpoint that returns all necessary data in one call
      const response = await axios.get(`${API_URL}/predictions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Set the stats data
      setStatsData(response.data.statsData);
      
      // Set completed matches count
      setCompletedMatches(response.data.completedMatchesCount);
      
      // Optionally update extra stats if coming from backend
      if (response.data.extraStats) {
        // You can choose to use some of the calculated stats from backend
        // or keep using your hardcoded values
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats data:", error);
      setLoading(false);
    }
  };

  // Function to sort data based on field and direction
  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      // For string fields (like name)
      if (field === "name") {
        return direction === "asc" 
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      
      // For numeric fields
      return direction === "asc" 
        ? a[field] - b[field]
        : b[field] - a[field];
    });
  };

  // Handle column header click for sorting
  const handleSort = (field) => {
    const newDirection = 
      field === sortField && sortDirection === "desc" ? "asc" : "desc";
    
    setSortField(field);
    setSortDirection(newDirection);
    
    const sortedData = sortData(statsData, field, newDirection);
    setStatsData(sortedData);
  };

  // Get sort indicator for column headers
  const getSortIndicator = (field) => {
    if (field !== sortField) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === "desc" ? "▼" : "▲"}
      </span>
    );
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setExtraStats({...editableStats});
    } else {
      // Enter edit mode
      setEditableStats({...extraStats});
    }
    setIsEditing(!isEditing);
  };

  const handleStatChange = (key, value) => {
    setEditableStats({
      ...editableStats,
      [key]: value
    });
  };

  // Toggle function for extra stats visibility
  const toggleExtraStats = () => {
    setShowExtraStats(!showExtraStats);
  };

  // Check if the current user is an admin
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <>
      <TopBar />

      <main className="flex-grow bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">

          <div className="bg-white shadow-md rounded-lg overflow-hidden h-[65vh] flex flex-col mb-6">
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
                <div className="overflow-x-auto">
                  <div className="bg-gray-50 border-b border-gray-200">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="sticky top-0 bg-gray-50 shadow-sm">
                          <th 
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center">
                              Name{getSortIndicator("name")}
                            </div>
                          </th>
                          <th 
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("totalPoints")}
                          >
                            <div className="flex items-center justify-end">
                              Points{getSortIndicator("totalPoints")}
                            </div>
                          </th>
                          <th 
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("correctPredictions")}
                          >
                            <div className="flex items-center justify-end">
                              Team Win(Accuracy){getSortIndicator("correctPredictions")}
                            </div>
                          </th>
                          <th 
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("correctPotmPredictions")}
                          >
                            <div className="flex items-center justify-end">
                              POTM{getSortIndicator("correctPotmPredictions")}
                            </div>
                          </th>
                          <th 
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("bothCorrectPredictions")}
                          >
                            <div className="flex items-center justify-end">
                              Both{getSortIndicator("bothCorrectPredictions")}
                            </div>
                          </th>
                          <th 
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("noPredictionCount")}
                          >
                            <div className="flex items-center justify-end">
                              No Prediction{getSortIndicator("noPredictionCount")}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statsData.length > 0 ? (
                          statsData.map((user, index) => {
                            const isInTop3 = index < 3 && sortField === "totalPoints" && sortDirection === "desc";
                            return (
                              <tr
                                key={user.id}
                                className={isInTop3 ? "bg-blue-50" : ""}
                              >
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getFirstName(user.name)}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.totalPoints}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {user.correctPredictions}/{completedMatches} ({user.accuracy.toFixed(1)}%)
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {user.correctPotmPredictions}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {user.bothCorrectPredictions}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {user.noPredictionCount}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
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
              </div>
            )}
          </div>

          {/* Extra Stats Card with Toggle */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div 
              className="p-4 sm:p-6 bg-blue-600 text-white flex justify-between items-center cursor-pointer"
              onClick={toggleExtraStats}
            >
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                Extra Statistics
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ml-2 transition-transform duration-300 ${showExtraStats ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </h2>
              {/* Only show edit button if user is admin and extra stats are visible */}
              {showExtraStats && isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    handleEditToggle();
                  }}
                  className="px-3 py-1 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition duration-300 text-sm font-medium"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              )}
            </div>
            
            {/* Collapsible content */}
            {showExtraStats && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Highest score in a week:</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.highestWeeklyScore}
                        onChange={(e) => handleStatChange('highestWeeklyScore', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.highestWeeklyScore}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Lowest score in a week:</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.lowestWeeklyScore}
                        onChange={(e) => handleStatChange('lowestWeeklyScore', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.lowestWeeklyScore}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Consecutive Wrong prediction:</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.consecutiveWrongPrediction}
                        onChange={(e) => handleStatChange('consecutiveWrongPrediction', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.consecutiveWrongPrediction}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Consecutive Right prediction:</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.consecutiveRightPrediction}
                        onChange={(e) => handleStatChange('consecutiveRightPrediction', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.consecutiveRightPrediction}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Highest +2 points Received by (week topper):</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.highestPlusPoints}
                        onChange={(e) => handleStatChange('highestPlusPoints', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.highestPlusPoints}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Highest -2 points received by (week lower):</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editableStats.highestMinusPoints}
                        onChange={(e) => handleStatChange('highestMinusPoints', e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{extraStats.highestMinusPoints}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default PredictionStats;
