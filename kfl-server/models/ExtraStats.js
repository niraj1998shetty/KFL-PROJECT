const mongoose = require('mongoose');

const ExtraStatsSchema = new mongoose.Schema({
  highestWeeklyScore: {
    type: String,
    required: true,
    default: "Unknown"
  },
  lowestWeeklyScore: {
    type: String,
    required: true,
    default: "Unknown"
  },
  consecutiveWrongPrediction: {
    type: String,
    required: true,
    default: "Unknown"
  },
  consecutiveRightPrediction: {
    type: String,
    required: true,
    default: "Unknown"
  },
  highestPlusPoints: {
    type: String,
    required: true,
    default: "Unknown"
  },
  highestMinusPoints: {
    type: String,
    required: true,
    default: "Unknown"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExtraStats', ExtraStatsSchema);