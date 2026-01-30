const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayersByTeam,
  createPlayer,
  bulkCreatePlayers,
  incrementPlayerMOM
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

// Admin-only route to increment player's MOM count
router.put('/:playerId/incrementMOM', admin, incrementPlayerMOM);

module.exports = router;