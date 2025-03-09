const mongoose = require('mongoose');

const SemifinalPredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teams: {
    type: [String],
    required: true,
    validate: {
      validator: function(teams) {
        return teams.length === 5 && new Set(teams).size === 5;
      },
      message: 'Must provide exactly 5 unique teams'
    }
  }
}, {
  timestamps: true
});

// Create a unique index to ensure a user can only have one semifinal prediction
SemifinalPredictionSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('SemifinalPrediction', SemifinalPredictionSchema);