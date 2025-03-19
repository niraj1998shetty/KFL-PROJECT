const asyncHandler = require('express-async-handler');
const Match = require('../models/Matches');
const Prediction = require('../models/Prediction');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
const getMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({}).sort({ date: 1, time: 1 });
  res.status(200).json(matches);
});

// @desc    Get today's matches
// @route   GET /api/matches/today
// @access  Private
const getTodayMatches = asyncHandler(async (req, res) => {
  // Format today's date as DD/MM/YYYY to match your existing format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const matches = await Match.find({ date: formattedDate }).sort({ time: 1 });
  res.status(200).json(matches);
});

// @desc    Get matches by specific date
// @route   GET /api/matches/date/:date
// @access  Private
const getMatchesByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  // Verify date format (DD/MM/YYYY)
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    res.status(400);
    throw new Error('Invalid date format. Use DD/MM/YYYY');
  }
  
  const matches = await Match.find({ date }).sort({ time: 1 });
  
  // Return empty array instead of 404 when no matches found
  res.status(200).json(matches);
});

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  
  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }
  
  res.status(200).json(match);
});

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private (Admin only)
const createMatch = asyncHandler(async (req, res) => {
  const { matchNumber, date, team1, team2, venue, time } = req.body;

  const match = await Match.create({
    matchNumber,
    date,
    team1,
    team2,
    venue,
    time
  });

  res.status(201).json(match);
});

const isMatchStarted = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  
  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }
  
  // Get current server time in UTC
  const serverTimeUTC = new Date();
  
  // Convert server time to IST (UTC+5:30)
  const serverTimeIST = new Date(serverTimeUTC.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Parse match date and time
  const [day, month, year] = match.date.split('/');
  const matchTimeStr = match.time.split(' ')[0]; // Extract time portion (e.g., "18:30")
  
  // Create match datetime string in IST format
  const matchDateTimeStr = `${year}-${month}-${day}T${matchTimeStr}:00+05:30`;
  const matchTimeIST = new Date(matchDateTimeStr);
  
  console.log('Server time (IST):', serverTimeIST);
  console.log('Match time (IST):', matchTimeIST);
  
  res.json({ started: serverTimeIST > matchTimeIST });
});

// @desc    Update match result
// @route   PUT /api/matches/:id/result
// @access  Private (Admin only)
const updateMatchResult = asyncHandler(async (req, res) => {
  const { winner, playerOfTheMatch } = req.body;

  const match = await Match.findById(req.params.id);
  
  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }
  
  match.result.winner = winner;
  match.result.playerOfTheMatch = playerOfTheMatch;
  match.result.completed = true;
  
  await match.save();

  // Update prediction points
  await updatePredictionPoints(match._id, winner, playerOfTheMatch);
  
  res.status(200).json(match);
});

// Helper function to update prediction points
const updatePredictionPoints = async (matchId, winner, playerOfTheMatch) => {
  const predictions = await Prediction.find({ match: matchId });
  
  for (const prediction of predictions) {
    let points = 0;
    let isCorrect = false;
    
    // Award points for correct winner prediction
    if (prediction.predictedWinner === winner) {
      points += 10;
      isCorrect = true;
    }
    
    // Additional points for correct player of the match
    if (prediction.playerOfTheMatch === playerOfTheMatch) {
      points += 5;
    }
    
    // Update prediction with points
    await Prediction.findByIdAndUpdate(prediction._id, {
      points,
      isCorrect
    });
  }
};

module.exports = {
  getMatches,
  getTodayMatches,
  getMatchById,
  getMatchesByDate,
  createMatch,
  isMatchStarted,
  updateMatchResult
};
