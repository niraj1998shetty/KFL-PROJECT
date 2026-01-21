
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch comprehensive user statistics
 * @param {string} userId - The user ID to fetch stats for
 * @returns {Promise<Object>} User stats including points, predictions, accuracy, etc.
 */
export const fetchUserStats = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    
    // Fetch all necessary data in parallel
    const [userResponse, statsResponse, completedMatchesResponse] = await Promise.all([
      // Get basic user info
      axios.get(`${API_URL}/auth/allUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      // Get prediction stats
      axios.get(`${API_URL}/predictions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      // Get completed matches count
      axios.get(`${API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    // Find the specific user from all users
    const user = userResponse.data.find(u => u._id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the user's stats
    const userStats = statsResponse.data.statsData.find(stat => stat.id === userId);
    
    // Count completed matches
    const completedMatches = completedMatchesResponse.data.filter(
      match => match.result && match.result.completed
    );

    // Combine all data
    return {
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      totalPoints: user.points || 0,
      weekPoints: user.weekPoints || 0,
      correctPredictions: userStats?.correctPredictions || 0,
      correctPotmPredictions: userStats?.correctPotmPredictions || 0,
      bothCorrectPredictions: userStats?.bothCorrectPredictions || 0,
      noPredictionCount: userStats?.noPredictionCount || 0,
      predictionsCount: userStats?.predictionsCount || 0,
      accuracy: userStats?.accuracy || 0,
      totalMatches: completedMatches.length
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

/**
 * Fetch stats for multiple users at once (optimized for tables)
 * @returns {Promise<Object>} Object containing users array with complete stats
 */
export const fetchAllUsersStats = async () => {
  try {
    const token = localStorage.getItem("token");
    
    // Fetch all necessary data in parallel
    const [usersResponse, statsResponse, matchesResponse] = await Promise.all([
      axios.get(`${API_URL}/auth/allUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/predictions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const users = usersResponse.data;
    const statsData = statsResponse.data.statsData;
    const completedMatches = matchesResponse.data.filter(
      match => match.result && match.result.completed
    );

    // Merge user data with stats
    const usersWithStats = users.map(user => {
      const userStats = statsData.find(stat => stat.id === user._id);
      
      return {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        totalPoints: user.points || 0,
        weekPoints: user.weekPoints || 0,
        correctPredictions: userStats?.correctPredictions || 0,
        correctPotmPredictions: userStats?.correctPotmPredictions || 0,
        bothCorrectPredictions: userStats?.bothCorrectPredictions || 0,
        noPredictionCount: userStats?.noPredictionCount || 0,
        predictionsCount: userStats?.predictionsCount || 0,
        accuracy: userStats?.accuracy || 0,
        totalMatches: completedMatches.length
      };
    });

    return {
      users: usersWithStats,
      totalMatches: completedMatches.length
    };
  } catch (error) {
    console.error("Error fetching all users stats:", error);
    throw error;
  }
};
