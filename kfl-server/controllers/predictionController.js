const asyncHandler = require('express-async-handler');
const Prediction = require('../models/Prediction');
const Match = require('../models/Matches');
const Player = require('../models/Player');
const User = require('../models/User');

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
  // First, check if the match exists
  const match = await Match.findById(req.params.matchId);
  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }

  // Get current time in UTC
  const serverTimeUTC = new Date();
  
  // Parse match date and time
  const [day, month, year] = match.date.split('/');
  const timeString = match.time.split(' ')[0];
  const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
  
  // Create match time in UTC
  const matchTimeUTC = new Date(Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    hours - 5, // Convert IST to UTC
    minutes - 30
  ));

  // If match hasn't started, only return the current user's prediction
  if (serverTimeUTC < matchTimeUTC) {
    const userPrediction = await Prediction.find({ 
      match: req.params.matchId, 
      user: req.user.id 
    }).populate({
      path: 'user',
      select: 'name mobile'
    });
    
    return res.status(200).json(userPrediction);
  }

  // If match has started, fetch and return all predictions
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
  // First, get all players to have a mapping of player ID to name
  const players = await Player.find({});
  
  // Create a map of player IDs to names for quick lookup
  const playerMap = players.reduce((map, player) => {
    map[player._id.toString()] = player.name;
    return map;
  }, {});

  const leaderboard = await Prediction.aggregate([
    {
      $lookup: {
        from: 'matches',
        localField: 'match',
        foreignField: '_id',
        as: 'matchDetails'
      }
    },
    {
      $unwind: '$matchDetails'
    },
    {
      $addFields: {
        // Store relevant match details for easier access
        matchCompleted: '$matchDetails.result.completed',
        actualPotmId: '$matchDetails.result.playerOfTheMatch',
        actualWinner: '$matchDetails.result.winner'
      }
    },
    {
      $group: {
        _id: '$user',
        totalPoints: { $sum: '$points' },
        correctPredictions: {
          $sum: {
            $cond: [{ $eq: ['$isCorrect', true] }, 1, 0]
          }
        },
        // Store all predictions and match results to process later
        predictions: {
          $push: {
            predictedPotm: '$playerOfTheMatch',
            predictedWinner: '$predictedWinner',
            actualPotmId: '$actualPotmId',
            actualWinner: '$actualWinner',
            matchCompleted: '$matchCompleted'
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
    }
  ]);
  
  // Post-process to count various correct predictions with playerMap
  const processedLeaderboard = leaderboard.map(entry => {
    // Initialize counters
    let correctPotmCount = 0;
    let bothCorrectCount = 0;
    
    entry.predictions.forEach(prediction => {
      if (prediction.matchCompleted) {
        // Check POTM prediction
        let isPotmCorrect = false;
        if (prediction.actualPotmId) {
          const actualPlayerName = playerMap[prediction.actualPotmId];
          if (actualPlayerName && actualPlayerName === prediction.predictedPotm) {
            correctPotmCount++;
            isPotmCorrect = true;
          }
        }
        
        // Check if both winner and POTM predictions are correct
        const isWinnerCorrect = prediction.predictedWinner === prediction.actualWinner;
        if (isWinnerCorrect && isPotmCorrect) {
          bothCorrectCount++;
        }
      }
    });
    
    // Calculate accuracy
    const accuracy = entry.totalPredictions > 0
      ? (entry.correctPredictions * 100) / entry.totalPredictions
      : 0;
    
    // Return processed entry
    return {
      _id: entry._id,
      name: entry.userDetails.name,
      mobile: entry.userDetails.mobile,
      totalPoints: entry.totalPoints,
      correctPredictions: entry.correctPredictions,
      correctPotmPredictions: correctPotmCount,
      bothCorrectPredictions: bothCorrectCount,
      totalPredictions: entry.totalPredictions,
      accuracy
    };
  });
  
  // Sort by total points (descending)
  processedLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  
  res.status(200).json(processedLeaderboard);
});


// @desc    Get predictions for multiple matches
// @route   GET /api/predictions/matches/batch
// @access  Private
const getBatchMatchPredictions = asyncHandler(async (req, res) => {
  // Get match IDs from query string as comma-separated values
  // Example: /api/predictions/matches/batch?ids=60d5e8b8e3b4f13d9c9a1b5a,60d5e8b8e3b4f13d9c9a1b5b
  const { ids } = req.query;
  
  if (!ids) {
    res.status(400);
    throw new Error('Match IDs are required');
  }
  
  // Split the comma-separated IDs
  const matchIds = ids.split(',');
  
  // Validate match IDs
  for (const id of matchIds) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error(`Invalid match ID format: ${id}`);
    }
  }
  
  // Fetch all predictions for the specified matches in one query
  const predictions = await Prediction.find({ match: { $in: matchIds } })
    .populate({
      path: 'user',
      select: 'name mobile _id'
    })
    .populate('match');
  
  // Group predictions by match
  const predictionsByMatch = {};
  
  for (const prediction of predictions) {
    const matchId = prediction.match._id.toString();
    
    if (!predictionsByMatch[matchId]) {
      predictionsByMatch[matchId] = [];
    }
    
    predictionsByMatch[matchId].push(prediction);
  }
  
  res.status(200).json(predictionsByMatch);
});

// @desc    Get all data needed for prediction stats
// @route   GET /api/predictions/stats
// @access  Private
const getStatsData = asyncHandler(async (req, res) => {
  // Step 1: Get all users
  const users = await User.find({}).select('_id name points');
  
  // Step 2: Get all completed matches
  const completedMatches = await Match.find({ 'result.completed': true });
  const completedMatchIds = completedMatches.map(match => match._id);
  
  // Step 3: Get player information for POTM validation
  const players = await Player.find({});
  const playerMap = players.reduce((map, player) => {
    map[player._id.toString()] = player.name;
    return map;
  }, {});
  
  // Step 4: Get all predictions for completed matches in one query
  const predictions = await Prediction.find({ match: { $in: completedMatchIds } })
    .populate('match')
    .populate({
      path: 'user',
      select: '_id name'
    });
  
  // Step 5: Process stats data manually for more accurate POTM calculation
  const statsMap = {};
  
  // Initialize stats for all users
  users.forEach(user => {
    statsMap[user._id.toString()] = {
      id: user._id,
      name: user.name,
      totalPoints: user.points || 0,
      predictionsCount: 0,
      correctPredictions: 0,
      correctPotmPredictions: 0,
      bothCorrectPredictions: 0,
      noPredictionCount: completedMatchIds.length, // Initialize with total matches
      accuracy: 0
    };
  });
  
  // Process each prediction
  predictions.forEach(prediction => {
    const userId = prediction.user._id.toString();
    const userStats = statsMap[userId];
    
    if (!userStats) return; // Skip if user not found (shouldn't happen)
    
    // Count prediction
    userStats.predictionsCount++;
    
    // Decrement no prediction count since we found a prediction
    userStats.noPredictionCount--;
    
    // Check if match result exists
    if (prediction.match.result && prediction.match.result.completed) {
      // Count correct team prediction
      if (prediction.isCorrect) {
        userStats.correctPredictions++;
      }
      
      // Count correct POTM prediction - need to compare names, not IDs
      let isPotmCorrect = false;
      if (prediction.match.result.playerOfTheMatch) {
        const potmId = prediction.match.result.playerOfTheMatch.toString();
        const actualPotmName = playerMap[potmId];
        
        if (actualPotmName && actualPotmName === prediction.playerOfTheMatch) {
          userStats.correctPotmPredictions++;
          isPotmCorrect = true;
        }
      }
      
      // Count both correct (team and POTM)
      if (prediction.isCorrect && isPotmCorrect) {
        userStats.bothCorrectPredictions++;
      }
    }
  });
  
  // Calculate accuracy for each user
  Object.values(statsMap).forEach(userStats => {
    if (userStats.predictionsCount > 0) {
      userStats.accuracy = parseFloat(((userStats.correctPredictions / completedMatchIds.length) * 100).toFixed(1));
      // userStats.accuracy = parseFloat(((userStats.correctPredictions / userStats.predictionsCount) * 100).toFixed(1)); //(for only predicted matches)
    }
  });
  
  // Convert map to array and sort by totalPoints
  const statsData = Object.values(statsMap).sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Return all necessary data
  res.status(200).json({
    statsData,
    completedMatchesCount: completedMatchIds.length
  });
});

// @desc    Get user-specific stats
// @route   GET /api/predictions/user-stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  // Get user ID from auth middleware
  const userId = req.user.id;
  
  // Get all completed matches
  const completedMatches = await Match.find({ 'result.completed': true });
  const completedMatchIds = completedMatches.map(match => match._id);
  const totalMatches = completedMatches.length;
  
  // Get player information for POTM validation
  const players = await Player.find({});
  const playerMap = players.reduce((map, player) => {
    map[player._id.toString()] = player.name;
    return map;
  }, {});
  
  // Get all predictions for the user for completed matches
  const userPredictions = await Prediction.find({ 
    user: userId,
    match: { $in: completedMatchIds } 
  }).populate('match');
  
  // Calculate stats
  let correctPredictions = 0;
  let correctPotmPredictions = 0;
  let bothCorrectPredictions = 0;
  let totalPoints = 0;
  
  userPredictions.forEach(prediction => {
    // Add points
    totalPoints += prediction.points || 0;
    
    // Check team prediction
    if (prediction.isCorrect) {
      correctPredictions++;
    }
    
    // Check POTM prediction
    let isPotmCorrect = false;
    if (prediction.match.result && prediction.match.result.playerOfTheMatch) {
      const potmId = prediction.match.result.playerOfTheMatch.toString();
      const actualPotmName = playerMap[potmId];
      
      if (actualPotmName && actualPotmName === prediction.playerOfTheMatch) {
        correctPotmPredictions++;
        isPotmCorrect = true;
      }
    }
    
    // Check if both correct
    if (prediction.isCorrect && isPotmCorrect) {
      bothCorrectPredictions++;
    }
  });
  
  // Get user info
  const user = await User.findById(userId);
  
  // Combine stats
  const userStats = {
    totalPoints: user.points || totalPoints, // Use points from user model if available
    correctPredictions,
    totalMatches,
    correctPotmPredictions,
    bothCorrectPredictions,
  };
  
  res.status(200).json({ userStats });
});

// In the getRecentPerformance function, modify the problematic code at line ~530
// Previous code:
// const teamA = match.teamA.split(' ').pop(); // Get last word of team name
// const teamB = match.teamB.split(' ').pop();
// const matchShort = `${teamA} vs ${teamB}`;

// Updated safe code with null checks:
const getRecentPerformance = asyncHandler(async (req, res) => {
  // Get user ID from auth middleware
  const userId = req.user.id;
  
  // Get all completed matches
  const completedMatches = await Match.find({ 'result.completed': true });
  
  // Convert string dates to actual Date objects for proper sorting
  const matchesWithParsedDates = completedMatches.map(match => {
    // Parse DD/MM/YYYY format
    const [day, month, year] = match.date.split('/');
    // Create Date object (note: month is 0-indexed in JS)
    const parsedDate = new Date(year, month - 1, day);
    
    // Parse time (assuming format like "14:00 IST")
    let timeValue = 0;
    if (match.time) {
      const timeParts = match.time.split(' ')[0].split(':');
      if (timeParts.length === 2) {
        timeValue = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      }
    }
    
    return {
      ...match.toObject(),
      _parsedDate: parsedDate,
      _timeValue: timeValue
    };
  });
  
  // Sort by parsed date (newest first) and then by time
  matchesWithParsedDates.sort((a, b) => {
    // First compare dates
    const dateComparison = b._parsedDate - a._parsedDate;
    if (dateComparison !== 0) return dateComparison;
    
    // If same date, compare times
    return b._timeValue - a._timeValue;
  });
  
  // Take only the 7 most recent matches
  const recentMatches = matchesWithParsedDates.slice(0, 7);
  
  // Get player information for POTM validation
  const players = await Player.find({});
  const playerMap = players.reduce((map, player) => {
    map[player._id.toString()] = player.name;
    return map;
  }, {});
  
  // Get match IDs for the recent matches
  const matchIds = recentMatches.map(match => match._id);
  
  // Get user predictions for these matches
  const predictions = await Prediction.find({
    user: userId,
    match: { $in: matchIds }
  }).populate('match');
  
  // Create a map of match ID to prediction for easier lookup
  const predictionMap = {};
  predictions.forEach(pred => {
    predictionMap[pred.match._id.toString()] = pred;
  });
  
  // Process match data with predictions
  const processedMatches = recentMatches.map((match, index) => {
    const matchId = match._id.toString();
    const prediction = predictionMap[matchId];
    
    // Default values - consider no prediction as incorrect (teamCorrect = false)
    let teamCorrect = false;
    let potmCorrect = false;
    let hasPrediction = false;
    
    if (prediction) {
      // User made a prediction for this match
      hasPrediction = true;
      teamCorrect = prediction.isCorrect || false;
      
      // Check POTM prediction
      if (match.result && match.result.playerOfTheMatch) {
        const potmId = match.result.playerOfTheMatch.toString();
        const actualPotmName = playerMap[potmId];
        
        potmCorrect = (actualPotmName && actualPotmName === prediction.playerOfTheMatch);
      }
    }
    
    // Create match display name safely with null checks
    const team1Short = match.team1 ? match.team1.split(' ').pop() : 'Team 1';
    const team2Short = match.team2 ? match.team2.split(' ').pop() : 'Team 2';
    
    return {
      matchId: matchId,
      match: match.team1 && match.team2 ? `${match.team1} vs ${match.team2}` : 'Match Data Missing',
      matchShort: `${team1Short} vs ${team2Short}`,
      matchNumber: match.matchNumber || `Match ${index + 1}`,
      date: match.date,
      teamCorrect,
      potmCorrect,
      hasPrediction
    };
  });
  
  // Return the matches in chronological order (oldest to newest)
  // This matches the order shown in your reference image
  processedMatches.reverse();
  
  res.status(200).json({ recentMatches: processedMatches });
});

// @desc    Get prediction counts for matches
// @route   POST /api/predictions/counts
// @access  Private
const getPredictionCounts = asyncHandler(async (req, res) => {
  const { matchIds } = req.body;

  if (!matchIds || !Array.isArray(matchIds)) {
    res.status(400);
    throw new Error('matchIds array is required');
  }

  // Get total user count
  const totalUsers = await User.countDocuments();

  // Get prediction counts for each match
  const counts = await Promise.all(
    matchIds.map(async (matchId) => {
      const predictionCount = await Prediction.countDocuments({ match: matchId });
      return {
        matchId,
        predictionCount,
        totalUsers
      };
    })
  );

  res.status(200).json(counts);
});

module.exports = {
  createPrediction,
  getUserPredictions,
  getUserMatchPrediction,
  getAllMatchPredictions,
  getLeaderboard,
  getBatchMatchPredictions,
  getStatsData,
  getUserStats,
  getRecentPerformance,
  getPredictionCounts
};
