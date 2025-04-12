const express = require('express');
const router = express.Router();
const {
  getExtraStats,
  updateExtraStats
} = require('../controllers/extraStats');
const { protect, admin } = require('../middleware/authMiddleware');

// Get extra stats - protected route for authenticated users
router.get('/', protect, getExtraStats);

// Update extra stats - protected route for admins only
router.put('/', protect, admin, updateExtraStats);

module.exports = router;