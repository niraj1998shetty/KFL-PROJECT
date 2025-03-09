const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  predictedWinner: {
    type: String,
    required: true
  },
  playerOfTheMatch: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only have one prediction per match
PredictionSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', PredictionSchema);