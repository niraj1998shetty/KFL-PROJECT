const asyncHandler = require('express-async-handler');
const Prediction = require('../models/Prediction');
const Match = require('../models/Matches');

// @desc    Create or update prediction
// @route   POST /api/predictions
// @access  Private
const createPrediction = asyncHandler(async (req, res) => {
  const { matchId, predictedWinner, playerOfTheMatch } = req.body;

  // Check if match exists
  const match = await Match.findById(matchId);
  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }

  // Check if match hasn't started yet
  const matchDate = match.date.split('/').reverse().join('-');
  const matchTime = match.time.split(' ')[0];
  const matchDateTime = new Date(`${matchDate}T${matchTime}`);
  
  if (new Date() > matchDateTime) {
    res.status(400);
    throw new Error('Match has already started, predictions are closed');
  }

  // Find if user already has a prediction for this match
  let prediction = await Prediction.findOne({
    user: req.user.id,
    match: matchId
  });

  if (prediction) {
    // Update existing prediction
    prediction.predictedWinner = predictedWinner;
    prediction.playerOfTheMatch = playerOfTheMatch;
    await prediction.save();
  } else {
    // Create new prediction
    prediction = await Prediction.create({
      user: req.user.id,
      match: matchId,
      predictedWinner,
      playerOfTheMatch
    });
  }

  res.status(201).json(prediction);
});

// @desc    Get predictions for a user
// @route   GET /api/predictions/user
// @access  Private
const getUserPredictions = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ user: req.user.id })
    .populate('match')
    .sort({ createdAt: -1 });
  
  res.status(200).json(predictions);
});

// @desc    Get prediction for a specific match by a user
// @route   GET /api/predictions/match/:matchId
// @access  Private
const getUserMatchPrediction = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findOne({
    user: req.user.id,
    match: req.params.matchId
  });
  
  if (!prediction) {
    return res.status(404).json({ message: 'No prediction found for this match' });
  }
  
  res.status(200).json(prediction);
});

// @desc    Get all predictions for a match
// @route   GET /api/predictions/match/:matchId/all
// @access  Private
const getAllMatchPredictions = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ match: req.params.matchId })
    .populate({
      path: 'user',
      select: 'name mobile'
    });
  
  res.status(200).json(predictions);
});

// @desc    Get leaderboard
// @route   GET /api/predictions/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Prediction.aggregate([
    {
      $group: {
        _id: '$user',
        totalPoints: { $sum: '$points' },
        correctPredictions: {
          $sum: {
            $cond: [{ $eq: ['$isCorrect', true] }, 1, 0]
          }
        },
        totalPredictions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        name: '$userDetails.name',
        mobile: '$userDetails.mobile',
        totalPoints: 1,
        correctPredictions: 1,
        totalPredictions: 1,
        accuracy: {
          $multiply: [
            { $divide: ['$correctPredictions', '$totalPredictions'] },
            100
          ]
        }
      }
    },
    {
      $sort: { totalPoints: -1, accuracy: -1 }
    }
  ]);
  
  res.status(200).json(leaderboard);
});

module.exports = {
  createPrediction,
  getUserPredictions,
  getUserMatchPrediction,
  getAllMatchPredictions,
  getLeaderboard
};