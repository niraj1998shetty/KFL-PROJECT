// In your Match schema (Matches.js)
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchNumber: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  team1: {
    type: String,
    required: true
  },
  team2: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  result: {
    winner: {
      type: String,
      default: null
    },
    playerOfTheMatch: {
      type: String,
      default: null
    },
    completed: {
      type: Boolean,
      default: false
    },
    noResult: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);