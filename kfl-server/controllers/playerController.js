const asyncHandler = require('express-async-handler');
const Player = require('../models/Player');

// @desc    Get all players
// @route   GET /api/players
// @access  Private
const getPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({}).sort({ name: 1 });
  res.status(200).json(players);
});

// @desc    Get players by team
// @route   GET /api/players/team/:teamCode
// @access  Private
const getPlayersByTeam = asyncHandler(async (req, res) => {
  const teamCode = req.params.teamCode;
  const players = await Player.find({ team: teamCode }).sort({ name: 1 });
  
  if (players.length === 0) {
    return res.status(404).json({ message: 'No players found for this team' });
  }
  
  res.status(200).json(players);
});

// @desc    Create a new player
// @route   POST /api/players
// @access  Private (Admin only)
const createPlayer = asyncHandler(async (req, res) => {
  const { name, team } = req.body;

  const player = await Player.create({
    name,
    team
  });

  res.status(201).json(player);
});

// @desc    Bulk create players
// @route   POST /api/players/bulk
// @access  Private (Admin only)
const bulkCreatePlayers = asyncHandler(async (req, res) => {
  const players = req.body.players;
  
  if (!Array.isArray(players) || players.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of players');
  }
  
  const createdPlayers = await Player.insertMany(players);
  res.status(201).json(createdPlayers);
});

// @desc    Increment player's MOM count
// @route   PUT /api/players/:playerId/incrementMOM
// @access  Private (Admin only)
const incrementPlayerMOM = asyncHandler(async (req, res) => {
  const { playerId } = req.params;
  
  const player = await Player.findByIdAndUpdate(
    playerId,
    { $inc: { momfrom25: 1 } },
    { new: true }
  );
  
  if (!player) {
    res.status(404);
    throw new Error('Player not found');
  }
  
  res.status(200).json({
    message: 'Player MOM count incremented successfully',
    player
  });
});

module.exports = {
  getPlayers,
  getPlayersByTeam,
  createPlayer,
  bulkCreatePlayers,
  incrementPlayerMOM
};