const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getUserPredictions,
  getUserMatchPrediction,
  getAllMatchPredictions,
  getLeaderboard,
  getBatchMatchPredictions,
  getStatsData,
  getUserStats,
  getRecentPerformance
} = require('../controllers/predictionController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected with authentication
router.use(protect);

// Create prediction and get user predictions
router.post('/', createPrediction);
router.get('/user', getUserPredictions);
router.get('/match/:matchId', getUserMatchPrediction);
router.get('/match/:matchId/all', getAllMatchPredictions);
router.get('/leaderboard', getLeaderboard);

router.get('/matches/batch', getBatchMatchPredictions);
router.get('/stats', getStatsData);
router.get('/user-stats', getUserStats);
router.get('/recent-performance', getRecentPerformance);

module.exports = router;