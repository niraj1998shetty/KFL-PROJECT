const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users' week points
// @route   GET /api/users/weekPoints
// @access  Private (Admin only)
const getAllWeekPoints = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const users = await User.find({}, 'name weekPoints');
  
  res.status(200).json(users);
});

// @desc    Reset week points for all users
// @route   PUT /api/users/weekPoints/reset
// @access  Private (Admin only)
const resetAllWeekPoints = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await User.updateMany({}, { weekPoints: 0 });

  res.status(200).json({
    message: 'Week points reset for all users'
  });
});

// @desc    Add week points to a specific user
// @route   PUT /api/users/weekPoints/add/:userId/:points
// @access  Private (Admin only)
const addWeekPoints = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const userId = req.params.userId;
  const points = parseInt(req.params.points);
  
  if (isNaN(points) || points < 0) {
    res.status(400);
    throw new Error('Please provide a valid number of points');
  }

  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.weekPoints += points;
  await user.save();

  res.status(200).json({
    message: `Successfully added ${points} week points to user ${user.name}`,
    currentWeekPoints: user.weekPoints
  });
});

module.exports = {
  getAllWeekPoints,
  resetAllWeekPoints,
  addWeekPoints
};