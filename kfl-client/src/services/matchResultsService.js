import axios from 'axios';

const KFL_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cache for player data to avoid repeated API calls
let playerCache = null;

/**
 * Fetch all players and cache them
 * @returns {Promise<Object>} - Map of player ID to player name
 */
const fetchPlayersCache = async () => {
  if (playerCache) {
    return playerCache;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${KFL_API_URL}/players`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    if (Array.isArray(response.data)) {
      playerCache = {};
      response.data.forEach(player => {
        playerCache[player._id] = player.name;
      });
      return playerCache;
    }
    return {};
  } catch (error) {
    console.warn('Could not fetch players for MOM resolution:', error.message);
    return {};
  }
};

/**
 * Fetch 2025 IPL match results from backend
 * Only fetches completed matches from your KFL database
 * @returns {Promise<Array>} - Array of match results
 */
export const fetchIPL2025Results = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${KFL_API_URL}/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from backend');
    }

    // Fetch player cache for resolving Man of the Match
    const players = await fetchPlayersCache();

    // Filter for completed matches from 2025 and 2026
    const completedMatches = response.data
      .filter(match => {
        const matchDate = parseMatchDate(match.date);
        const year = matchDate.getFullYear();
        return (
          (year === 2025 || year === 2026) &&
          match.result &&
          match.result.completed === true
        );
      })
      .map(match => formatBackendMatchData(match, players))
      .sort((a, b) => {
        return parseInt(a.matchNo) - parseInt(b.matchNo);
      });

    return completedMatches;
  } catch (error) {
    console.error('Error fetching 2025 data from backend:', error.message);
    throw error;
  }
};



/**
 * Format backend match data
 * @param {Object} match - Match from backend database
 * @param {Object} players - Map of player ID to player name
 * @returns {Object} - Formatted match object
 */
const formatBackendMatchData = (match, players = {}) => {
  const matchDate = parseMatchDate(match.date);
  
  return {
    id: match._id,
    matchNo: match.matchNumber?.toString() || 'N/A',
    date: matchDate.toISOString().split('T')[0],
    team1: match.team1 || 'Team A',
    team2: match.team2 || 'Team B',
    venue: formatVenue(match.venue),
    result: formatResult(match),
    manOfTheMatch: extractPlayerName(match.result?.playerOfTheMatch, players),
  };
};

/**
 * Extract player name from playerOfTheMatch field
 * Handles both string and ObjectId cases
 * @param {string|Object} playerData - Player name or ObjectId
 * @param {Object} players - Map of player ID to player name
 * @returns {string} - Player name or "No-one"
 */
const extractPlayerName = (playerData, players = {}) => {
  if (!playerData) {
    return 'No-one';
  }

  // If it's a string
  if (typeof playerData === 'string') {
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-f]{24}$/i.test(playerData)) {
      // Try to find player name using the ObjectId
      const playerName = players[playerData];
      return playerName || 'No-one';
    }
    // It's already a player name string
    return playerData;
  }

  // If it's an object, try to get name or _id
  if (typeof playerData === 'object') {
    return playerData.name || playerData.fullName || 'No-one';
  }

  return 'No-one';
};

/**
 * Parse date from DD/MM/YYYY format to Date object
 * @param {string} dateStr - Date in DD/MM/YYYY format
 * @returns {Date} - JavaScript Date object
 */
const parseMatchDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    // Create date in UTC to avoid timezone conversion issues
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  }
  
  return new Date(dateStr);
};

/**
 * Format match result from backend data
 * @param {Object} match - Match object with result field
 * @returns {string} - Formatted result string
 */
const formatResult = (match) => {
  if (!match.result || !match.result.completed || !match.result.winner) {
    return 'No result';
  }

  const { winner } = match.result;
  
  const otherTeam = match.team1 === winner ? match.team2 : match.team1;
  return `${winner} defeated ${otherTeam}`;
};

/**
 * Format venue name - returns full venue name
 * @param {string} venue - Full venue name
 * @returns {string} - Full venue name
 */
const formatVenue = (venue) => {
  if (!venue) return 'N/A';
  
  // If there's a comma, return everything after it (trimmed)
  const parts = venue.split(',');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  // If no comma, return the full venue name
  return venue.trim();
};


