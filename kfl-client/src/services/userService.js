import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch comprehensive stats for a specific user
 * @param {string} userId - MongoDB user _id
 * @returns {Promise<Object>} User stats object
 */
export const fetchUserStats = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Auth token not found");
    }

    // Fetch all required data in parallel
    const [
      usersResponse,
      statsResponse,
      matchesResponse,
    ] = await Promise.all([
      axios.get(`${API_URL}/auth/allUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/predictions/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // Find user
    const user = usersResponse.data.find((u) => u._id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find user's prediction stats
    const userStats = statsResponse.data?.statsData?.find(
      (stat) => stat.id === userId
    );

    // Count completed matches
    const completedMatches = matchesResponse.data.filter(
      (match) => match.result && match.result.completed
    );

    // Return combined data
    return {
      id: user._id,
      name: user.name,
      mobile: user.mobile,

      totalPoints: user.points || 0,
      weekPoints: user.weekPoints || 0,

      correctPredictions: userStats.correctPredictions || 0,
      correctPotmPredictions: userStats?.correctPotmPredictions || 0,
      bothCorrectPredictions: userStats?.bothCorrectPredictions || 0,
      noPredictionCount: userStats?.noPredictionCount || 0,
      predictionsCount: userStats?.predictionsCount || 0,

      accuracy: userStats?.accuracy || 0,
      totalMatches: completedMatches.length,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};
