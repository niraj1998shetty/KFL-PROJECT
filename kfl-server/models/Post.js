const mongoose = require('mongoose');  // Make sure this import is at the top of the file

const reactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['like', 'fire', 'thumbsUp', 'dislike', 'sad', 'cry', 'hardLaugh', 'highFive'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPoll: {
    type: Boolean,
    default: false
  },
  pollOptions: [pollOptionSchema],
  reactions: [reactionSchema],
  readBy: [{  // Added this field to track users who have read the post
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual field to check if post is editable (within 30 minutes of creation)
postSchema.virtual('isEditable').get(function() {
  const thirtyMinutesInMs = 30 * 60 * 1000;
  const timeDifference = Date.now() - this.createdAt.getTime();
  return timeDifference <= thirtyMinutesInMs;
});

// Method to get all reaction counts
postSchema.methods.getReactionCounts = function() {
  const counts = {
    like: 0,
    fire: 0,
    thumbsUp: 0,
    dislike: 0,
    sad: 0,
    cry: 0,
    hardLaugh: 0,
    highFive: 0
  };
  
  this.reactions.forEach(reaction => {
    counts[reaction.type]++;
  });
  
  return counts;
};

// Methods for checking if a user has reacted with a specific type
postSchema.methods.hasUserReacted = function(userId, type) {
  return this.reactions.some(reaction => 
    reaction.user.toString() === userId.toString() && reaction.type === type
  );
};

module.exports = mongoose.model('Post', postSchema);