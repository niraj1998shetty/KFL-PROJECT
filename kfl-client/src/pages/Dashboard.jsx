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
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  const [allPredictions, setAllPredictions] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  
  const API_URL = 'http://localhost:5000/api';

  // to check match has started or not--
  const hasMatchStarted = (match) => {
    const matchDate = match.date.split('/').reverse().join('-');
    const matchTime = match.time.split(' ')[0];
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    return new Date() > matchDateTime;
  };

  useEffect(() => {
    // Only fetch data if currentUser is available
    if (!currentUser) {
      return;
    }

    const fetchTodaysMatches = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/matches/today`);
        setTodaysMatches(res.data);
        
        // Fetch all players for prediction modal
        const playersRes = await axios.get(`${API_URL}/players`);
        setPlayers(playersRes.data);
        
        // Fetch user's predictions
        const predictionsRes = await axios.get(`${API_URL}/predictions/user`);
        console.log('predictionsRes:', predictionsRes.data);
 
        setUserPredictions(predictionsRes.data);
        
        // Fetch all users
        const usersRes = await axios.get(`${API_URL}/auth/allUsers`);
        setAllUsers(usersRes.data);
        
        // Format predictions for easier access
        const formattedPredictions = {};
        predictionsRes.data.forEach((pred) => {
          if (pred.match) {
            // Check if pred.match is not null or undefined
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
        for (const match of res.data) {
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
        console.error('Error fetching today\'s matches:', error);
        setLoading(false);
      }
    };

    fetchTodaysMatches();
  }, [currentUser]);  // Only depend on currentUser, not API_URL

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
        const match = todaysMatches.find((m) => m._id === matchId);
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Date: {formattedDate}</h2>
            {todaysMatches.length > 0 ? (
              <p className="text-lg text-gray-600 mt-2">
                {todaysMatches.length === 1 
                  ? `Today's Match: ${todaysMatches[0].team1} vs ${todaysMatches[0].team2}` 
                  : `Today's Matches: ${todaysMatches.length}`}
              </p>
            ) : (
              <p className="text-lg text-gray-600 mt-2">No matches scheduled for today</p>
            )}
          </div>
          
          {todaysMatches.length > 0 && (
            <div className="mb-8">
              {todaysMatches.map((match) => {
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
          
          {todaysMatches.length > 0 && todaysMatches.map((match) => renderPredictionTable(match))}
          
          {todaysMatches.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-center text-lg text-gray-600">No matches scheduled for today. Check back tomorrow!</p>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
      
      {activePredictionModal !== null && todaysMatches.find(match => match._id === activePredictionModal) && (
        <MatchPredictionModal 
          match={todaysMatches.find(match => match._id === activePredictionModal)}
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
