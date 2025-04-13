const asyncHandler = require('express-async-handler');
const ExtraStats = require('../models/ExtraStats');

// @desc    Get extra stats
// @route   GET /api/extrastats
// @access  Private
const getExtraStats = asyncHandler(async (req, res) => {
  // Try to find existing stats
  let extraStats = await ExtraStats.findOne().sort('-createdAt');
  
  // If no stats exist, create default stats
  if (!extraStats) {
    extraStats = await ExtraStats.create({
      highestWeeklyScore: "Sagar, Samiksha, Adesh (34)",
      lowestWeeklyScore: "Anusha (5)",
      consecutiveWrongPrediction: "Anusha (12 matches)",
      consecutiveRightPrediction: "Akhilesh (7 matches)",
      highestPlusPoints: "Sagar, Sameeksha, Adesh, Aadi",
      highestMinusPoints: "Anusha (2 times)"
    });
  }
  
  res.status(200).json(extraStats);
});

// @desc    Update extra stats
// @route   PUT /api/extrastats
// @access  Private/Admin
const updateExtraStats = asyncHandler(async (req, res) => {
  const {
    highestWeeklyScore,
    lowestWeeklyScore,
    consecutiveWrongPrediction,
    consecutiveRightPrediction,
    highestPlusPoints,
    highestMinusPoints
  } = req.body;

  // Validate input
  if (!highestWeeklyScore || !lowestWeeklyScore || !consecutiveWrongPrediction || 
      !consecutiveRightPrediction || !highestPlusPoints || !highestMinusPoints) {
    res.status(400);
    throw new Error('All extra stats fields are required');
  }

  // Find latest stats entry
  let extraStats = await ExtraStats.findOne().sort('-createdAt');

  if (extraStats) {
    // Update existing stats
    extraStats.highestWeeklyScore = highestWeeklyScore;
    extraStats.lowestWeeklyScore = lowestWeeklyScore;
    extraStats.consecutiveWrongPrediction = consecutiveWrongPrediction;
    extraStats.consecutiveRightPrediction = consecutiveRightPrediction;
    extraStats.highestPlusPoints = highestPlusPoints;
    extraStats.highestMinusPoints = highestMinusPoints;
    extraStats.lastUpdated = Date.now();
    
    await extraStats.save();
  } else {
    // Create new stats entry if none exists
    extraStats = await ExtraStats.create({
      highestWeeklyScore,
      lowestWeeklyScore,
      consecutiveWrongPrediction,
      consecutiveRightPrediction,
      highestPlusPoints,
      highestMinusPoints
    });
  }

  res.status(200).json(extraStats);
});

module.exports = {
  getExtraStats,
  updateExtraStats
};