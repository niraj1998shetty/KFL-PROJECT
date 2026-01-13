import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import TeamCard from "../components/TeamCard";
import PlayerCard from "../components/PlayerCard";
import TopBar from "../components/TopBar";

const TeamsPlayersPage = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playersError, setPlayersError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Extract unique teams from players data
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setTeamsLoading(true);
        setError(null);
        
        // Fetch all players first to extract unique teams
        const response = await axios.get(`${API_URL}/players`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Extract unique teams with team codes
        const uniqueTeams = {};
        response.data.forEach((player) => {
          // Skip players with empty or no team
          if (!player.team || player.team.trim() === "") {
            return;
          }
          
          if (!uniqueTeams[player.team]) {
            uniqueTeams[player.team] = {
              code: player.team,
              name: getTeamName(player.team),
              playerCount: 0,
            };
          }
          uniqueTeams[player.team].playerCount++;
        });

        const teamsArray = Object.values(uniqueTeams).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setTeams(teamsArray);
        setTeamsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch teams");
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [API_URL]);

  // Fetch players for selected team
  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    setPlayersLoading(true);
    setPlayersError(null);

    try {
      const response = await axios.get(
        `${API_URL}/players/team/${team.code}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const sortedPlayers = response.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setPlayers(sortedPlayers);
      setPlayersLoading(false);
    } catch (err) {
      setPlayersError(
        err.response?.data?.message || "Failed to fetch players"
      );
      setPlayers([]);
      setPlayersLoading(false);
    }
  };

  // Close player view and return to teams
  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setPlayers([]);
  };

  // Map team codes to team names
  const getTeamName = (code) => {
    const teamNames = {
      CSK: "Chennai Super Kings",
      MI: "Mumbai Indians",
      RCB: "Royal Challengers Bangalore",
      SRH: "Sunrisers Hyderabad",
      KKR: "Kolkata Knight Riders",
      DC: "Delhi Capitals",
      PBKS: "Punjab Kings",
      RR: "Rajasthan Royals",
      GT: "Gujarat Titans",
      LSG: "Lucknow Super Giants",
    };
    return teamNames[code] || code;
  };

  // Get team colors for UI
  const getTeamColor = (code) => {
    const teamColors = {
      CSK: "from-yellow-400 to-yellow-600",
      MI: "from-blue-500 to-blue-700",
      RCB: "from-red-500 to-red-700",
      SRH: "from-orange-500 to-orange-700",
      KKR: "from-purple-600 to-purple-800",
      DC: "from-blue-400 to-blue-600",
      PBKS: "from-red-400 to-red-600",
      RR: "from-pink-500 to-pink-700",
      GT: "from-cyan-400 to-cyan-600",
      LSG: "from-blue-400 to-blue-900",
    };
    return teamColors[code] || "from-gray-500 to-gray-700";
  };

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600 font-semibold">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-4">
      <TopBar
        pageTitle={selectedTeam ? selectedTeam.name : "Teams & Players"}
        showBackButton={selectedTeam !== null}
        onBackClick={selectedTeam ? handleBackToTeams : null}
      />

      <div className="pt-5 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Teams View */}
        <AnimatePresence mode="wait">
          {!selectedTeam ? (
            <motion.div
              key="teams-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  Teams
                </h1>
                <p className="text-gray-600">
                  Select a team to view its players
                </p>
              </div> */}

              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">📭</div>
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-2">
                    No Teams Found
                  </h2>
                  <p className="text-gray-600">
                    Teams will appear here once they are added to the system.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.code}
                      team={team}
                      onSelect={() => handleTeamSelect(team)}
                      colorGradient={getTeamColor(team.code)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // Players View
            <motion.div
              key="players-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                {/* <button
                  onClick={handleBackToTeams}
                  className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors duration-200"
                >
                  <span>←</span>
                  <span>Back to Teams</span>
                </button> */}

                {/* <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  {selectedTeam.name}
                </h1> */}
                <p className="text-gray-600">
                  {players.length} {players.length === 1 ? "player" : "players"}{" "}
                  in this team
                </p>
              </div>

              {playersError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {playersError}
                </div>
              )}

              {playersLoading ? (
                <div className="flex justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600 font-semibold">
                      Loading players...
                    </p>
                  </div>
                </div>
              ) : players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">👥</div>
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-2">
                    No Players Found
                  </h2>
                  <p className="text-gray-600">
                    No players are currently assigned to this team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {players.map((player, index) => (
                    <PlayerCard
                      key={player._id || index}
                      player={player}
                      team={selectedTeam}
                      index={index}
                      colorGradient={getTeamColor(selectedTeam.code)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamsPlayersPage;
