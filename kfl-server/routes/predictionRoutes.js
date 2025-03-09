const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getUserPredictions,
  getUserMatchPrediction,
  getAllMatchPredictions,
  getLeaderboard
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

module.exports = router;