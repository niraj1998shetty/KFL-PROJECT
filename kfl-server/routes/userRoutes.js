const express = require('express');
const router = express.Router();
const { 
  getUserPoints,
  addPoints,
  deductPoints,
  resetPoints,
  adminAddPoints,
  adminAddPointsToUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Points routes
router.get('/points', protect, getUserPoints);
router.put('/points/add', protect, addPoints);
router.put('/points/deduct', protect, deductPoints);
router.put('/points/reset', protect, resetPoints);
router.put('/points/add/:userId/:points', protect, adminAddPoints);
router.put('/admin/addPoints/:userId/:points', protect,adminAddPointsToUser )

// You can add more user-specific routes here as you develop more features

module.exports = router;