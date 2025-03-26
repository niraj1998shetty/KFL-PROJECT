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
const { 
  getAllWeekPoints, 
  resetAllWeekPoints, 
  addWeekPoints 
} = require('../controllers/weekpointsController');
const { protect } = require('../middleware/authMiddleware');

// Existing points routes
router.get('/points', protect, getUserPoints);
router.put('/points/add', protect, addPoints);
router.put('/points/deduct', protect, deductPoints);
router.put('/points/reset', protect, resetPoints);
router.put('/points/add/:userId/:points', protect, adminAddPoints);
router.put('/admin/addPoints/:userId/:points', protect, adminAddPointsToUser);

// New week points routes
router.get('/weekPoints', protect, getAllWeekPoints);
router.put('/weekPoints/reset', protect, resetAllWeekPoints);
router.put('/weekPoints/add/:userId/:points', protect, addWeekPoints);

module.exports = router;