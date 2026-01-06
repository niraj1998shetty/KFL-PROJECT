import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import TopBar from "../components/TopBar";
import MatchPredictionModal from "../components/MatchPredictionModal";
import { capitalizeFirstLetter } from "../helpers/functions";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [predictions, setPredictions] = useState({});
  const [activePredictionModal, setActivePredictionModal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [playerDetails, setPlayerDetails] = useState({});
  const [userPredictions, setUserPredictions] = useState([]);
  const [allPredictions, setAllPredictions] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState("");
  const [matchStatus, setMatchStatus] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    
    return `${dayName}, ${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextDay(),
    onSwipedRight: () => goToPreviousDay(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  //disable the previous btn
  const isPreviousDisabled = () => {
    const minDate = new Date(2025, 2, 22);
    minDate.setHours(0, 0, 0, 0);
    const currentDateCopy = new Date(currentDate);
    currentDateCopy.setHours(0, 0, 0, 0);
    return currentDateCopy <= minDate;
  };

  // navigate to previous
  const goToPreviousDay = () => {
    if (isPreviousDisabled()) return;
    setDateLoading(true);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // navigate to next
  const goToNextDay = () => {
    setDateLoading(true);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // go back to today
  const goToToday = () => {
    if (isToday(currentDate)) return;

    setDateLoading(true);
    setCurrentDate(new Date());

    // fetch today's matches directly
    axios
      .get(`${API_URL}/matches/today`)
      .then((res) => {
        setMatches(res.data);

        fetchPredictionsForMatches(res.data);
      })
      .catch((error) => {
        console.error("Error fetching today's matches:", error);
        setMatches([]);
      })
      .finally(() => {
        setDateLoading(false);
      });
  };

  // Update players details mapping when players are loaded
  useEffect(() => {
    const playerDetailsMap = players.reduce((acc, player) => {
      acc[player._id] = player.name;
      return acc;
    }, {});
    setPlayerDetails(playerDetailsMap);
  }, [players]);

  // Helper functions to fetch
  const fetchPredictionsForMatches = async (matchesList) => {
    try {
      //  all users' predictions for each macth
      const allMatchPredictions = {};
      for (const match of matchesList) {
        try {
          const allPredictionsRes = await axios.get(
            `${API_URL}/predictions/match/${match._id}/all`
          );
          allMatchPredictions[match._id] = allPredictionsRes.data;
        } catch (error) {
          console.error(
            `Error fetching predictions for match ${match._id}:`,
            error
          );
          allMatchPredictions[match._id] = [];
        }
      }

      // Format
      const formattedPredictions = {};
      for (const match of matchesList) {
        const userPred = userPredictions.find(
          (p) => p.match && p.match._id === match._id
        );
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
      console.error("Error fetching predictions for matches:", error);
    }
  };

  const fetchMatchStatus = async (matchId) => {
    try {
      const res = await axios.get(`${API_URL}/matches/${matchId}/started`);
      return res.data.started;
    } catch (error) {
      console.error("Error checking match status:", error);
      return false;
    }
  };

  const fetchMatchesForDate = async (date) => {
    try {
      setDateLoading(true);
      const formattedDate = formatDate(date).split(', ')[1]; // Extract DD/MM/YYYY part for API
      setDisplayDate(formatDate(date)); // Set full display date with day name

      const encodedDate = encodeURIComponent(formattedDate);

      let matchesData = [];

      if (isToday(date)) {
        try {
          const todayRes = await axios.get(`${API_URL}/matches/today`);
          matchesData = todayRes.data;

          if (matchesData.length === 0) {
            const dateRes = await axios.get(
              `${API_URL}/matches/date/${encodedDate}`
            );
            matchesData = dateRes.data;
          }
        } catch (todayError) {
          console.error("Error fetching today's matches:", todayError);

          try {
            const dateRes = await axios.get(
              `${API_URL}/matches/date/${encodedDate}`
            );
            matchesData = dateRes.data;
          } catch (dateError) {
            console.error(
              `Error fetching matches by date (${formattedDate}):`,
              dateError
            );
          }
        }
      } else {
        const res = await axios.get(`${API_URL}/matches/date/${encodedDate}`);
        matchesData = res.data;
      }

      setMatches(matchesData);

      if (matchesData.length > 0) {
        await fetchPredictionsForMatches(matchesData);
      } else {
        setPredictions({});
        setAllPredictions({});
      }

      setDateLoading(false);
    } catch (error) {
      console.error(
        `Error fetching matches for date ${formatDate(date)}:`,
        error
      );
      setMatches([]);
      setPredictions({});
      setAllPredictions({});
      setDateLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const today = new Date();
        setDisplayDate(formatDate(today));

        const playersRes = await axios.get(`${API_URL}/players`);
        setPlayers(playersRes.data);

        const predictionsRes = await axios.get(`${API_URL}/predictions/user`);
        setUserPredictions(predictionsRes.data);

        const usersRes = await axios.get(`${API_URL}/auth/allUsers`);
        setAllUsers(usersRes.data);

        const todayMatches = await axios.get(`${API_URL}/matches/today`);
        setMatches(todayMatches.data);

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
            const allPredictionsRes = await axios.get(
              `${API_URL}/predictions/match/${match._id}/all`
            );
            allMatchPredictions[match._id] = allPredictionsRes.data;
          } catch (error) {
            if (error.response && error.response.status === 403) {
              // Predictions not visible yet
              allMatchPredictions[match._id] = [];
            } else {
              console.error(
                `Error fetching predictions for match ${match._id}:`,
                error
              );
              allMatchPredictions[match._id] = [];
            }
          }
        }

        setAllPredictions(allMatchPredictions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

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

  useEffect(() => {
    const loadMatchStatuses = async () => {
      const statuses = {};
      for (const match of matches) {
        statuses[match._id] = await fetchMatchStatus(match._id);
      }
      setMatchStatus(statuses);
    };

    if (matches.length > 0) {
      loadMatchStatuses();
    }
  }, [matches]);

  const handlePredictionSubmit = async (matchId, winningTeam, potm) => {
    try {
      const predictionData = {
        matchId,
        predictedWinner: winningTeam,
        playerOfTheMatch: potm,
      };

      const res = await axios.post(`${API_URL}/predictions`, predictionData);

      const newPredictions = { ...predictions };
      newPredictions[matchId] = {
        id: res.data._id,
        user: currentUser.name,
        mobile: currentUser.mobile,
        winningTeam: res.data.predictedWinner,
        potm: res.data.playerOfTheMatch,
      };

      setPredictions(newPredictions);

      const newAllPredictions = { ...allPredictions };

      const existingPredictionIndex = newAllPredictions[matchId]?.findIndex(
        (p) => p.user?._id === currentUser._id
      );

      if (
        existingPredictionIndex !== -1 &&
        existingPredictionIndex !== undefined
      ) {
        // Update existing prediction
        newAllPredictions[matchId][existingPredictionIndex] = {
          ...newAllPredictions[matchId][existingPredictionIndex],
          predictedWinner: winningTeam,
          playerOfTheMatch: potm,
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
            mobile: currentUser.mobile,
          },
          predictedWinner: winningTeam,
          playerOfTheMatch: potm,
        });
      }

      setAllPredictions(newAllPredictions);

      const updatedUserPredictions = [...userPredictions];
      const existingUserPredIndex = updatedUserPredictions.findIndex(
        (p) => p.match && p.match._id === matchId
      );

      if (existingUserPredIndex !== -1) {
        updatedUserPredictions[existingUserPredIndex] = {
          ...updatedUserPredictions[existingUserPredIndex],
          predictedWinner: winningTeam,
          playerOfTheMatch: potm,
        };
      } else {
        const match = matches.find((m) => m._id === matchId);
        if (!match) {
          console.error("Match not found:", matchId);
          return;
        }
        updatedUserPredictions.push({
          _id: res.data._id,
          match: match,
          predictedWinner: winningTeam,
          playerOfTheMatch: potm,
        });
      }
      setUserPredictions(updatedUserPredictions);

      setActivePredictionModal(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting prediction:", error);
      alert(
        "Failed to submit prediction: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const renderPredictionTable = (match) => {
    const matchPredictions = allPredictions[match._id] || [];
    const matchStarted = matchStatus[match._id];

    const userPredictionsList = allUsers.map((user) => {
      const prediction = matchPredictions.find((p) => p.user?._id === user._id);

      return {
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
        isCurrentUser: user._id === currentUser?._id,
        prediction: prediction || null,
      };
    });

    return (
      <div key={match._id} className="mb-8">
        <h3 className="text-lg md:text-xl font-semibold mb-4">
          Predictions for {match.team1} vs {match.team2}
          {!matchStarted && (
            <span className="block md:inline text-xs md:text-sm font-normal text-gray-500 md:ml-2 mt-1 md:mt-0">
              (Others predictions will be visible once the match starts)
            </span>
          )}
        </h3>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POTM
                </th>
                {!matchStarted && (
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userPredictionsList.length > 0 ? (
                userPredictionsList
                  .filter((userPred) => matchStarted || userPred.isCurrentUser)
                  .map((userPred) => {
                    return (
                      <tr
                        key={userPred.userId}
                        className={userPred.isCurrentUser ? "bg-gray-50" : ""}
                      >
                        <td className="px-2 md:px-6 py-2 md:py-4 text-sm">
                          {capitalizeFirstLetter(userPred.name || "Unknown")}
                          {userPred.isCurrentUser && (
                            <span className="ml-1 text-purple-700">(You)</span>
                          )}
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-4 text-sm text-gray-800 break-words">
                          {userPred.prediction
                            ? userPred.prediction.predictedWinner
                            : "--"}
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-4 text-sm text-gray-800 break-words">
                          {userPred.prediction
                            ? userPred.prediction.playerOfTheMatch
                            : "--"}
                        </td>
                        {!matchStarted && (
                          <td className="px-2 md:px-6 py-2 md:py-4 text-sm">
                            {userPred.isCurrentUser &&
                              !matchStarted &&
                              (userPred.prediction ? (
                                <button
                                  onClick={() =>
                                    handleEditPrediction(match._id)
                                  }
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                  Edit
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handlePredictionClick(match._id)
                                  }
                                  className="text-purple-700 hover:text-indigo-800 font-medium text-sm"
                                >
                                  Give Prediction
                                </button>
                              ))}
                          </td>
                        )}
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-2 md:px-6 py-4 text-center text-gray-500"
                  >
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

  const renderDateNavigation = () => {
    return (
      <div className="flex justify-center items-center mb-6 space-x-2 md:space-x-4">
        <button
          onClick={goToPreviousDay}
          disabled={dateLoading || isPreviousDisabled()}
          className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 md:px-3 rounded-l flex items-center text-xs md:text-sm ${
            isPreviousDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 md:h-4 md:w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Prev
        </button>

        <button
          onClick={goToToday}
          disabled={dateLoading || isToday(currentDate)}
          className={`${
            isToday(currentDate)
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
          } text-white font-bold py-1 px-2 md:px-4 rounded text-xs md:text-sm ${
            isToday(currentDate) ? "opacity-50" : ""
          }`}
        >
          Go to today
        </button>

        <button
          onClick={goToNextDay}
          disabled={dateLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 md:px-3 rounded-r flex items-center text-xs md:text-sm"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 md:h-4 md:w-4 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  };

  const renderMatchDetails = (match) => {
    const matchStarted = matchStatus[match._id];
    const userPrediction = predictions[match._id];

    // Check if match is completed and has a result
    const isMatchCompleted = match.result?.completed;
    const matchWinner = isMatchCompleted ? match.result.winner : null;
    const playerOfTheMatch = isMatchCompleted 
      ? playerDetails[match.result.playerOfTheMatch] 
      : null;

    return (
      <div
        key={match._id}
        className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-3 md:p-4 rounded-lg shadow mb-3 md:mb-4"
      >
        <div className="font-semibold text-sm md:text-base mb-2 md:mb-0">
          Match {match.matchNumber}: {match.team1} vs {match.team2}
          
          {isMatchCompleted ? (
            <div className="text-green-600 md:ml-2 block md:inline mt-1 md:mt-0 text-sm">
              <span>Winning team: {matchWinner} </span>
              {playerOfTheMatch && (
                <span className="ml-2 text-orange-600">
                  POTM: {playerOfTheMatch}
                </span>
              )}
            </div>
          ) : matchStarted ? (
            <span className="text-orange-500 md:ml-2 block md:inline mt-1 md:mt-0">
              (Match started)
            </span>
          ) : (
            <span className="text-gray-500 text-xs md:ml-2 block md:inline mt-1 md:mt-0">
              (You can't predict after {match.time})
            </span>
          )}
        </div>

        {!isMatchCompleted && (
          <>
            {userPrediction ? (
              <button
                onClick={() => handleEditPrediction(match._id)}
                className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 md:px-4 md:py-2 rounded transition duration-300 text-sm ${
                  matchStarted ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={matchStarted}
              >
                Edit Prediction
              </button>
            ) : (
              <button
                onClick={() => handlePredictionClick(match._id)}
                className={`bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-3 py-1 md:px-4 md:py-2 rounded transition duration-300 text-sm ${
                  matchStarted ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={matchStarted}
              >
                Give Prediction
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <TopBar onMenuClick={toggleSidebar} />
        <div className="flex flex-1">
          <main className="flex-1 p-4 md:p-6 bg-gray-100 flex items-center justify-center min-h-[80vh] mb-6">
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-primary rounded-full"></span>
            </span>
          </main>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full ">
      <TopBar onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {/* <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}

        <main {...swipeHandlers} className="flex-1 p-4 md:p-6 bg-gray-100 overflow-x-hidden min-h-[80vh] touch-pan-y mb-6">
          {renderDateNavigation()}

          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold">
              Date: {displayDate}
              {isToday(currentDate) && (
                <span className="ml-2 text-purple-700">(Today)</span>
              )}
            </h2>

            {dateLoading ? (
              <p className="text-base md:text-lg text-gray-600 mt-2">
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-primary rounded-full"></span>
                </span>
              </p>
            ) : matches.length > 0 ? (
              <p className="text-base md:text-lg text-gray-600 mt-2">
                {matches.length === 1
                  ? `Match: ${matches[0].team1} vs ${matches[0].team2}`
                  : `Matches: ${matches.length}`}
              </p>
            ) : (
              <p className="text-base md:text-lg text-gray-600 mt-2">
                No matches scheduled for this date
              </p>
            )}
          </div>

          {!dateLoading && matches.length > 0 && (
            <div className="mb-6 md:mb-8">
              {matches.map(renderMatchDetails)}
            </div>
          )}

          {!dateLoading &&
            matches.length > 0 &&
            matches.map((match) => renderPredictionTable(match))}

          {!dateLoading && matches.length === 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <p className="text-center text-base md:text-lg text-gray-600">
                No predictions available for this date.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* <Footer /> */}

      {activePredictionModal !== null &&
        matches.find((match) => match._id === activePredictionModal) && (
          <MatchPredictionModal
            match={matches.find((match) => match._id === activePredictionModal)}
            onClose={() => {
              setActivePredictionModal(null);
              setIsEditing(false);
            }}
            onSubmit={(winningTeam, potm) =>
              handlePredictionSubmit(activePredictionModal, winningTeam, potm)
            }
            players={players}
            isEditing={isEditing}
            initialPrediction={predictions[activePredictionModal] || null}
          />
        )}
    </div>
  );
};

export default Dashboard;