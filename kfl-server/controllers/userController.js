const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user points
// @route   GET /api/users/points
// @access  Private
const getUserPoints = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    points: user.points
  });
});

// @desc    Add points to user
// @route   PUT /api/users/points/add
// @access  Private
const addPoints = asyncHandler(async (req, res) => {
  const { points } = req.body;
  
  if (!points || isNaN(points) || points <= 0) {
    res.status(400);
    throw new Error('Please provide a valid positive number of points');
  }

  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.points += parseInt(points);
  await user.save();

  res.status(200).json({
    message: `Successfully added ${points} points`,
    currentPoints: user.points
  });
});

// @desc    Deduct points from user
// @route   PUT /api/users/points/deduct
// @access  Private
const deductPoints = asyncHandler(async (req, res) => {
  const { points } = req.body;
  
  if (!points || isNaN(points) || points <= 0) {
    res.status(400);
    throw new Error('Please provide a valid positive number of points');
  }

  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.points < points) {
    res.status(400);
    throw new Error('Insufficient points');
  }

  user.points -= parseInt(points);
  await user.save();

  res.status(200).json({
    message: `Successfully deducted ${points} points`,
    currentPoints: user.points
  });
});

// @desc    Admin add points to a specific user
// @route   PUT /api/users/points/add/:userId/:points
// @access  Private (Admin only)
const adminAddPoints = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized');
    }
  
    const userId = req.params.userId;
    const points = parseInt(req.params.points);
    
    if (isNaN(points) || points <= 0) {
      res.status(400);
      throw new Error('Please provide a valid positive number of points');
    }
  
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
  
    user.points += points;
    await user.save();
  
    res.status(200).json({
      message: `Successfully added ${points} points to user ${user.name}`,
      currentPoints: user.points
    });
});
  

// @desc    Admin add points to a specific user
// @route   PUT /api/users/admin/addPoints/:userId/:points
// @access  Private (Admin only)
const adminAddPointsToUser = asyncHandler(async (req, res) => {
    // Check if admin
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
  
    user.points += points;
    await user.save();
  
    res.status(200).json({
      message: `Successfully added ${points} points to user ${user.name}`,
      currentPoints: user.points
    });
  });

// @desc    Reset user points
// @route   PUT /api/users/points/reset
// @access  Private (Admin only)
const resetPoints = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to reset points');
  }

  const user = userId ? await User.findById(userId) : await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.points = 0;
  await user.save();

  res.status(200).json({
    message: 'Points reset successfully',
    currentPoints: user.points
  });
});

module.exports = {
  getUserPoints,
    addPoints,
    adminAddPoints,
    adminAddPointsToUser,
  deductPoints,
  resetPoints
};