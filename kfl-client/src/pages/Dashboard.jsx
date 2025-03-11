import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import MatchPredictionModal from '../components/MatchPredictionModal';
import { capitalizeFirstLetter } from '../helpers/functions';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [predictions, setPredictions] = useState({});
  const [activePredictionModal, setActivePredictionModal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  const [allPredictions, setAllPredictions] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [dateLoading, setDateLoading] = useState(false);
  
  // For date navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState('');
  
  const API_URL = 'http://localhost:5000/api';

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if we should disable the previous button
  const isPreviousDisabled = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDateCopy = new Date(currentDate);
    currentDateCopy.setHours(0, 0, 0, 0);
    return currentDateCopy <= today;
  };
  
  // to check match has started or not
  const hasMatchStarted = (match) => {
    const matchDate = match.date.split('/').reverse().join('-');
    const matchTime = match.time.split(' ')[0];
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    return new Date() > matchDateTime;
  };

  // Function to navigate to previous day
  const goToPreviousDay = () => {
    if (isPreviousDisabled()) return;
    
    setDateLoading(true);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // Function to navigate to next day
  const goToNextDay = () => {
    setDateLoading(true);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Function to go back to today
  const goToToday = () => {
    if (isToday(currentDate)) return;
    
    setDateLoading(true);
    setCurrentDate(new Date());
    
    // Directly fetch today's matches to ensure consistency
    axios.get(`${API_URL}/matches/today`)
      .then(res => {
        setMatches(res.data);
        
        // Then fetch all predictions for these matches
        fetchPredictionsForMatches(res.data);
      })
      .catch(error => {
        console.error('Error fetching today\'s matches:', error);
        setMatches([]);
      })
      .finally(() => {
        setDateLoading(false);
      });
  };

  // Helper function to fetch predictions for a list of matches
  const fetchPredictionsForMatches = async (matchesList) => {
    try {
      // Fetch all users' predictions for each match
      const allMatchPredictions = {};
      for (const match of matchesList) {
        try {
          const allPredictionsRes = await axios.get(`${API_URL}/predictions/match/${match._id}/all`);
          allMatchPredictions[match._id] = allPredictionsRes.data;
        } catch (error) {
          console.error(`Error fetching predictions for match ${match._id}:`, error);
          allMatchPredictions[match._id] = [];
        }
      }
      
      // Format predictions for easier access
      const formattedPredictions = {};
      for (const match of matchesList) {
        const userPred = userPredictions.find(p => p.match && p.match._id === match._id);
        if (userPred) {
          formattedPredictions[match._id] = {
            id: userPred._id,
            user: currentUser.name,
            mobile: currentUser.mobile,
            winningTeam: userPred.predictedWinner,
            potm: userPred.playerOfTheMatch,
          };
        }
      }
      
      setPredictions(formattedPredictions);
      setAllPredictions(allMatchPredictions);
    } catch (error) {
      console.error('Error fetching predictions for matches:', error);
    }
  };

  // Fetch matches for the specified date
  const fetchMatchesForDate = async (date) => {
    try {
      setDateLoading(true);
      const formattedDate = formatDate(date);
      setDisplayDate(formattedDate);
      
      // Properly encode the date for the URL to handle slashes
      const encodedDate = encodeURIComponent(formattedDate);
      
      let matchesData = [];
      
      // For today's date, try both endpoints in case of issues
      if (isToday(date)) {
        try {
          // First try the today endpoint since it's more reliable
          const todayRes = await axios.get(`${API_URL}/matches/today`);
          matchesData = todayRes.data;
          
          // If no matches returned, try the date endpoint as fallback
          if (matchesData.length === 0) {
            const dateRes = await axios.get(`${API_URL}/matches/date/${encodedDate}`);
            matchesData = dateRes.data;
          }
        } catch (todayError) {
          console.error('Error fetching today\'s matches:', todayError);
          // Fall back to date-based query
          try {
            const dateRes = await axios.get(`${API_URL}/matches/date/${encodedDate}`);
            matchesData = dateRes.data;
          } catch (dateError) {
            console.error(`Error fetching matches by date (${formattedDate}):`, dateError);
          }
        }
      } else {
        // For other dates, use the date endpoint
        const res = await axios.get(`${API_URL}/matches/date/${encodedDate}`);
        matchesData = res.data;
      }
      
      setMatches(matchesData);
      
      // Fetch all predictions if we have matches
      if (matchesData.length > 0) {
        await fetchPredictionsForMatches(matchesData);
      } else {
        // Clear predictions if no matches
        setPredictions({});
        setAllPredictions({});
      }
      
      setDateLoading(false);
    } catch (error) {
      console.error(`Error fetching matches for date ${formatDate(date)}:`, error);
      setMatches([]);
      setPredictions({});
      setAllPredictions({});
      setDateLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if currentUser is available
    if (!currentUser) {
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Set the display date
        const today = new Date();
        setDisplayDate(formatDate(today));
        
        // Fetch all players for prediction modal
        const playersRes = await axios.get(`${API_URL}/players`);
        setPlayers(playersRes.data);
        
        // Fetch user's predictions
        const predictionsRes = await axios.get(`${API_URL}/predictions/user`);
        setUserPredictions(predictionsRes.data);
        
        // Fetch all users
        const usersRes = await axios.get(`${API_URL}/auth/allUsers`);
        setAllUsers(usersRes.data);
        
        // Fetch today's matches
        const todayMatches = await axios.get(`${API_URL}/matches/today`);
        setMatches(todayMatches.data);
        
        // Format predictions for easier access
        const formattedPredictions = {};
        predictionsRes.data.forEach((pred) => {
          if (pred.match) {
            formattedPredictions[pred.match._id] = {
              id: pred._id,
              user: currentUser.name,
              mobile: currentUser.mobile,
              winningTeam: pred.predictedWinner,
              potm: pred.playerOfTheMatch,
            };
          } else {
            console.warn("Prediction with null or undefined match:", pred);
          }
        });
        setPredictions(formattedPredictions);
        
        // Fetch all users' predictions for each match
        const allMatchPredictions = {};
        for (const match of todayMatches.data) {
          try {
            const allPredictionsRes = await axios.get(`${API_URL}/predictions/match/${match._id}/all`);
            allMatchPredictions[match._id] = allPredictionsRes.data;
          } catch (error) {
            console.error(`Error fetching predictions for match ${match._id}:`, error);
            allMatchPredictions[match._id] = [];
          }
        }
        
        setAllPredictions(allMatchPredictions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);  // Only depend on currentUser, not API_URL

  // Effect to fetch matches when the date changes
  useEffect(() => {
    if (currentUser) {
      fetchMatchesForDate(currentDate);
    }
  }, [currentDate, currentUser]);

  const handlePredictionClick = (matchId) => {
    setActivePredictionModal(matchId);
    setIsEditing(false);
  };

  const handleEditPrediction = (matchId) => {
    setActivePredictionModal(matchId);
    setIsEditing(true);
  };

  const handlePredictionSubmit = async (matchId, winningTeam, potm) => {
    try {
      const predictionData = {
        matchId,
        predictedWinner: winningTeam,
        playerOfTheMatch: potm
      };
      
      const res = await axios.post(`${API_URL}/predictions`, predictionData);
      
      // Update local predictions
      const newPredictions = { ...predictions };
      newPredictions[matchId] = {
        id: res.data._id,
        user: currentUser.name,
        mobile: currentUser.mobile,
        winningTeam: res.data.predictedWinner,
        potm: res.data.playerOfTheMatch
      };
      
      setPredictions(newPredictions);
      
      // Update all predictions state
      const newAllPredictions = { ...allPredictions };
      
      // Checking if this is a new prediction or an update
      const existingPredictionIndex = newAllPredictions[matchId]?.findIndex(
        p => p.user?._id === currentUser._id
      );
      
      if (existingPredictionIndex !== -1 && existingPredictionIndex !== undefined) {
        // Update existing prediction
        newAllPredictions[matchId][existingPredictionIndex] = {
          ...newAllPredictions[matchId][existingPredictionIndex],
          predictedWinner: winningTeam,
          playerOfTheMatch: potm
        };
      } else {
        // Adding new prediction
        if (!newAllPredictions[matchId]) {
          newAllPredictions[matchId] = [];
        }
        
        newAllPredictions[matchId].push({
          _id: res.data._id,
          user: {
            _id: currentUser._id,
            name: currentUser.name,
            mobile: currentUser.mobile
          },
          predictedWinner: winningTeam,
          playerOfTheMatch: potm
        });
      }
      
      setAllPredictions(newAllPredictions);
      
      // Update userPredictions state
      const updatedUserPredictions = [...userPredictions];
      const existingUserPredIndex = updatedUserPredictions.findIndex(p => p.match && p.match._id === matchId);
      
      if (existingUserPredIndex !== -1) {
        // Update existing prediction
        updatedUserPredictions[existingUserPredIndex] = {
          ...updatedUserPredictions[existingUserPredIndex],
          predictedWinner: winningTeam,
          playerOfTheMatch: potm
        };
      } else {
        // Add new prediction
        const match = matches.find((m) => m._id === matchId);
        if (!match) {
          console.error("Match not found:", matchId);
          return;
        }
        updatedUserPredictions.push({
          _id: res.data._id,
          match: match,
          predictedWinner: winningTeam,
          playerOfTheMatch: potm
        });
      }
      setUserPredictions(updatedUserPredictions);
      
      setActivePredictionModal(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Failed to submit prediction: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // render prediction tables based on match status
  const renderPredictionTable = (match) => {
    const matchPredictions = allPredictions[match._id] || [];
    const matchStarted = hasMatchStarted(match);
    
    // list of all users with their predictions (if any)
    const userPredictionsList = allUsers.map(user => {
      // Find this user's prediction for this match
      const prediction = matchPredictions.find(p => p.user?._id === user._id);
      
      return {
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
        isCurrentUser: user._id === currentUser?._id,
        prediction: prediction || null
      };
    });

    return (
      <div key={match._id} className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Predictions for {match.team1} vs {match.team2}
          {!matchStarted && <span className="text-sm font-normal text-gray-500 ml-2">(Other predictions will be visible once the match starts)</span>}
        </h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winning Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POTM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userPredictionsList.length > 0 ? (
                userPredictionsList
                  // Filter to show only current user if match hasn't started
                  .filter(userPred => matchStarted || userPred.isCurrentUser)
                  .map((userPred) => {
                    return (
                      <tr key={userPred.userId} className={userPred.isCurrentUser ? "bg-gray-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {capitalizeFirstLetter(userPred.name || 'Unknown')}
                          {userPred.isCurrentUser && <span className="ml-2 text-blue-500">(You)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                          {userPred.prediction ? userPred.prediction.predictedWinner : "--"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                          {userPred.prediction ? userPred.prediction.playerOfTheMatch : "--"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userPred.isCurrentUser && !matchStarted && (
                            userPred.prediction ? (
                              <button
                                onClick={() => handleEditPrediction(match._id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePredictionClick(match._id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Make Prediction
                              </button>
                            )
                          )}
                          {matchStarted && userPred.isCurrentUser && !userPred.prediction && (
                            <span className="text-red-500">Not predicted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Navigation controls
  const renderDateNavigation = () => {
    return (
      <div className="flex justify-center items-center mb-6 space-x-4">
        <button 
          onClick={goToPreviousDay}
          disabled={dateLoading || isPreviousDisabled()}
          className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l flex items-center ${
            isPreviousDisabled() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
        
        <button
          onClick={goToToday}
          disabled={dateLoading || isToday(currentDate)}
          className={`${isToday(currentDate) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-6 rounded ${
            isToday(currentDate) ? 'opacity-50' : ''
          }`}
        >
          Today
        </button>
        
        <button 
          onClick={goToNextDay}
          disabled={dateLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r flex items-center"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen min-w-full">
        <TopBar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
            <p className="text-xl">Loading...</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen min-w-full forFullWidth">
      <TopBar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 bg-gray-100">
          {/* Date navigation controls */}
          {renderDateNavigation()}
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              Date: {displayDate}
              {isToday(currentDate) && <span className="ml-2 text-blue-500">(Today)</span>}
            </h2>
            
            {dateLoading ? (
              <p className="text-lg text-gray-600 mt-2">Loading matches...</p>
            ) : matches.length > 0 ? (
              <p className="text-lg text-gray-600 mt-2">
                {matches.length === 1 
                  ? `Match: ${matches[0].team1} vs ${matches[0].team2}` 
                  : `Matches: ${matches.length}`}
              </p>
            ) : (
              <p className="text-lg text-gray-600 mt-2">No matches scheduled for this date</p>
            )}
          </div>
          
          {!dateLoading && matches.length > 0 && (
            <div className="mb-8">
              {matches.map((match) => {
                const matchStarted = hasMatchStarted(match);
                const userPrediction = predictions[match._id];
                
                return (
                  <div key={match._id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
                    <div className="font-semibold">
                      Match {match.matchNumber}: {match.team1} vs {match.team2}
                      {matchStarted && (
                        <span className="text-orange-500 ml-2">(Match has started)</span>
                      )}
                    </div>
                    {userPrediction ? (
                      <button
                        onClick={() => handleEditPrediction(match._id)}
                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300 ${
                          matchStarted ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={matchStarted}
                      >
                        Edit prediction
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePredictionClick(match._id)}
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 ${
                          matchStarted ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={matchStarted}
                      >
                        Give prediction
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {!dateLoading && matches.length > 0 && matches.map((match) => renderPredictionTable(match))}
          
          {!dateLoading && matches.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-center text-lg text-gray-600">No matches scheduled for this date. Try another day!</p>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
      
      {activePredictionModal !== null && matches.find(match => match._id === activePredictionModal) && (
        <MatchPredictionModal 
          match={matches.find(match => match._id === activePredictionModal)}
          onClose={() => {
            setActivePredictionModal(null);
            setIsEditing(false);
          }}
          onSubmit={(winningTeam, potm) => handlePredictionSubmit(activePredictionModal, winningTeam, potm)}
          players={players}
          isEditing={isEditing}
          initialPrediction={predictions[activePredictionModal] || null}
        />
      )}
    </div>
  );
};

export default Dashboard;
