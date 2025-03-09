const express = require('express');
const router = express.Router();
const {
  getMatches,
  getTodayMatches,
  getMatchById,
  createMatch,
  updateMatchResult
} = require('../controllers/matchController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected with authentication
router.use(protect);

// Get all matches and today's matches
router.get('/', getMatches);
router.get('/today', getTodayMatches);
router.get('/:id', getMatchById);

// Admin-only routes for creating and updating matches
router.post('/', admin, createMatch);
router.put('/:id/result', admin, updateMatchResult);

module.exports = router;