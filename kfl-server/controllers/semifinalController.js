const asyncHandler = require('express-async-handler');
const SemifinalPrediction = require('../models/SemifinalPrediction');

// @desc    Create a new semifinal prediction
// @route   POST /api/semifinals
// @access  Private
const createSemifinalPrediction = asyncHandler(async (req, res) => {
  const { teams } = req.body;

  // Check if teams array is valid
  if (!teams || !Array.isArray(teams) || teams.length !== 5) {
    res.status(400);
    throw new Error('Please provide exactly 5 teams');
  }

  // Check for duplicate teams
  if (new Set(teams).size !== 5) {
    res.status(400);
    throw new Error('All teams must be unique');
  }

  // Check if user already has a prediction
  const existingPrediction = await SemifinalPrediction.findOne({ user: req.user._id });
  
  if (existingPrediction) {
    res.status(400);
    throw new Error('You already have a semifinal prediction. Please use PUT to update.');
  }

  const prediction = await SemifinalPrediction.create({
    user: req.user._id,
    teams
  });

  res.status(201).json(prediction);
});

const isEditingAllowed = asyncHandler(async (req, res) => {
  // Get current UTC time
  const currentUTCDate = new Date();
  
  // Convert to IST by adding 5 hours and 30 minutes
  const currentISTDate = new Date(currentUTCDate.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Set deadline date in IST (March 21, 2025 at midnight IST)
  const editDeadlineIST = new Date('2026-03-22T15:00:00+05:30');
  
  const allowed = currentISTDate < editDeadlineIST;
  
  res.status(200).json({ allowed });
});

// @desc    Update user's semifinal prediction
// @route   PUT /api/semifinals
// @access  Private
const updateSemifinalPrediction = asyncHandler(async (req, res) => {
  
  const currentUTCDate = new Date();
  
  // Convert to IST by adding 5 hours and 30 minutes
  const currentISTDate = new Date(currentUTCDate.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Set deadline date in IST (March 21, 2025 at midnight IST)
  const editDeadlineIST = new Date('2026-03-22T15:00:00+05:30');
  
  if (currentISTDate >= editDeadlineIST) {
    res.status(403);
    throw new Error('Semifinal predictions can no longer be edited after March 21, 2025 (IST)');
  }

  const { teams } = req.body;

  // Check if teams array is valid
  if (!teams || !Array.isArray(teams) || teams.length !== 5) {
    res.status(400);
    throw new Error('Please provide exactly 5 teams');
  }

  // Check for duplicate teams
  if (new Set(teams).size !== 5) {
    res.status(400);
    throw new Error('All teams must be unique');
  }

  // Find and update prediction
  const prediction = await SemifinalPrediction.findOneAndUpdate(
    { user: req.user._id },
    { teams },
    { new: true, upsert: true }
  );

  res.status(200).json(prediction);
});

// @desc    Get current user's semifinal prediction
// @route   GET /api/semifinals/me
// @access  Private
const getUserSemifinalPrediction = asyncHandler(async (req, res) => {
  const prediction = await SemifinalPrediction.findOne({ user: req.user._id });
  
  if (!prediction) {
    return res.status(404).json({ message: 'No prediction found' });
  }
  
  res.status(200).json(prediction);
});

// @desc    Get all users' semifinal predictions
// @route   GET /api/semifinals/all
// @access  Private
const getAllSemifinalPredictions = asyncHandler(async (req, res) => {
  // Current date check for prediction visibility
  const currentUTCDate = new Date();
  
  // Convert to IST by adding 5 hours and 30 minutes
  const currentISTDate = new Date(currentUTCDate.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Set visibility date in IST (March 21, 2025 at midnight IST)
  const visibilityDateIST = new Date('2026-03-22T15:00:00+05:30');
  
  // Before visibility date, only return current user's prediction
  if (currentISTDate < visibilityDateIST) {
    const prediction = await SemifinalPrediction.findOne({ user: req.user._id })
      .populate('user', 'name mobile');
    
    return res.status(200).json(prediction ? [prediction] : []);
  }
  
  // After visibility date, return all predictions
  const predictions = await SemifinalPrediction.find()
    .populate('user', 'name mobile')
    .sort('createdAt');
  
  res.status(200).json(predictions);
});

module.exports = {
  createSemifinalPrediction,
  isEditingAllowed,
  updateSemifinalPrediction,
  getUserSemifinalPrediction,
  getAllSemifinalPredictions
};
