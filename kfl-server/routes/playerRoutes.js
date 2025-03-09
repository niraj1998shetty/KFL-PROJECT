const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayersByTeam,
  createPlayer,
  bulkCreatePlayers
} = require('../controllers/playerController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected with authentication
router.use(protect);

// Get players
router.get('/', getPlayers);
router.get('/team/:teamCode', getPlayersByTeam);

// Admin-only routes for creating players
router.post('/', admin, createPlayer);
router.post('/bulk', admin, bulkCreatePlayers);

module.exports = router;