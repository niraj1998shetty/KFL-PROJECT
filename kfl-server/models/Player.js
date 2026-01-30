const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['batter', 'wk-batter', 'bowler', 'all rounder', ''],
    default: ''
  },
  momfrom25: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', PlayerSchema);
