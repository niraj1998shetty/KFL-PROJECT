const mongoose = require('mongoose');

const whitelistedNumberSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Please add a mobile number'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WhitelistedNumber', whitelistedNumberSchema);