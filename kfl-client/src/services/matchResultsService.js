import axios from 'axios';
import { ipl2025Matches } from '../data/ipl2025Matches';
import { ipl2025PlayerMapping } from '../data/ipl2025PlayerMapping';

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
 * Fetch IPL match results (2025 from static data + 2026 from backend)
 * Includes both completed matches and matches with no result
 * @returns {Promise<Array>} - Array of match results
 */
export const fetchIPL2025Results = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch player cache for resolving Man of the Match
    const players = await fetchPlayersCache();
    
    // Format 2025 historical data - INCLUDE ALL MATCHES (completed AND noResult)
    const formatted2025Matches = ipl2025Matches
      .filter(match => {
        // Include matches that are either completed or have no result
        return match.result && (match.result.completed === true || match.result.noResult === true);
      })
      .map(match => formatBackendMatchData(match, players))
      .sort((a, b) => parseInt(a.matchNo) - parseInt(b.matchNo));
    
    // Fetch 2026 matches from backend
    let matches2026 = [];
    try {
      const response = await axios.get(`${KFL_API_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.data && Array.isArray(response.data)) {
        matches2026 = response.data
          .filter(match => {
            const matchDate = parseMatchDate(match.date);
            const year = matchDate.getFullYear();
            // Include 2026 matches that are either completed or have no result
            return (
              year === 2026 &&
              match.result &&
              (match.result.completed === true || match.result.noResult === true)
            );
          })
          .map(match => formatBackendMatchData(match, players))
          .sort((a, b) => parseInt(a.matchNo) - parseInt(b.matchNo));
      }
    } catch (backendError) {
      console.warn('Could not fetch 2026 matches from backend:', backendError.message);
      // Continue with 2025 data only
    }

    // Combine both datasets
    const allMatches = [...formatted2025Matches, ...matches2026];
    
    return allMatches;
  } catch (error) {
    console.error('Error fetching match results:', error.message);
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
    noResult: match.result?.noResult || false,
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
      // First try to find player name using the ObjectId from API
      const playerName = players[playerData];
      if (playerName) {
        return playerName;
      }
      
      // Fallback to static mapping for 2025 season data
      const staticPlayerName = ipl2025PlayerMapping[playerData];
      if (staticPlayerName) {
        return staticPlayerName;
      }
      
      // If not found in either mapping, log and return 'No-one'
      console.warn(`Player ID ${playerData} not found in cache or static mapping`);
      return 'No-one';
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
 * Handles both completed matches and matches with no result
 * @param {Object} match - Match object with result field
 * @returns {string} - Formatted result string
 */
const formatResult = (match) => {
  // Check for no result first
  if (match.result && match.result.noResult === true) {
    return 'No result';
  }
  
  // Check if match was not completed or has no winner
  if (!match.result || !match.result.completed || !match.result.winner) {
    return 'No result';
  }

  const { winner } = match.result;
  
  const otherTeam = match.team1 === winner ? match.team2 : match.team1;
  return `${winner} defeated ${otherTeam}`;
};

/**
 * Format venue name - returns city/location name
 * @param {string} venue - Full venue name (e.g., "Stadium Name, City")
 * @returns {string} - City name or full venue name
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