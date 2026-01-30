const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');

// Emoji mapping for reactions
const reactionEmojis = {
  like: "❤️",
  fire: "🔥",
  thumbsUp: "👍",
  dislike: "👎",
  sad: "🥲",
  cry: "😭",
  hardLaugh: "🤣",
  highFive: "🙌"
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, isPoll, pollOptions } = req.body;
  
  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Post content is required');
  }

  // Extract user tags from content (words starting with @)
  const taggedUsernames = content.match(/@([a-zA-Z0-9_]+)/g) || [];
  const tags = [];
  
  // Find user IDs for tags
  if (taggedUsernames.length > 0) {
    for (const tag of taggedUsernames) {
      const username = tag.substring(1); // Remove @ symbol
      const user = await User.findOne({ name: new RegExp(`^${username}$`, 'i') });
      
      if (user) {
        tags.push(user._id);
      }
    }
  }

  // Handle poll creation
  let pollData = [];
  if (isPoll && pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
    pollData = pollOptions.map(option => ({
      text: option,
      votes: []
    }));
  }

  // Create post
  const post = await Post.create({
    content,
    author: req.user.id,
    tags,
    isPoll: !!isPoll,
    pollOptions: pollData
  });

  // Populate author info before sending response
  await post.populate('author', 'name');
  await post.populate('tags', 'name');

  res.status(201).json(post);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
  // Extract pagination parameters from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const markAsRead = req.query.markAsRead === 'true';
  
  // Get total count for pagination info
  const total = await Post.countDocuments();
  
  // If markAsRead is true, update posts to mark them as read by this user
  if (markAsRead) {
    await Post.updateMany(
      { 
        readBy: { $ne: req.user.id },
        author: { $ne: req.user.id } // Don't mark own posts
      },
      { $addToSet: { readBy: req.user.id } }
    );
  }
  
  // Fetch posts with pagination
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name isAdmin')
    .populate('tags', 'name')
    .populate('reactions.user', 'name');

  // Format posts to include reaction counts and editability
  const formattedPosts = posts.map(post => {
    const postObj = post.toObject({ virtuals: true });
    postObj.reactionCounts = post.getReactionCounts();
    postObj.userReactions = {
      like: post.hasUserReacted(req.user.id, 'like'),
      fire: post.hasUserReacted(req.user.id, 'fire'),
      thumbsUp: post.hasUserReacted(req.user.id, 'thumbsUp'),
      dislike: post.hasUserReacted(req.user.id, 'dislike'),
      sad: post.hasUserReacted(req.user.id, 'sad'),
      cry: post.hasUserReacted(req.user.id, 'cry'),
      hardLaugh: post.hasUserReacted(req.user.id, 'hardLaugh'),
      highFive: post.hasUserReacted(req.user.id, 'highFive')
    };
    // Group reactions by type with user info for easy display
    postObj.reactionsByType = {};
    Object.keys(reactionEmojis).forEach(type => {
      postObj.reactionsByType[type] = post.reactions
        .filter(r => r.type === type)
        .map(r => ({
          userId: r.user._id,
          username: r.user.name
        }));
    });
    postObj.hasRead = post.readBy && post.readBy.includes(req.user.id);
    return postObj;
  });

  // Return pagination metadata along with posts
  res.status(200).json({
    posts: formattedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name isAdmin')
    .populate('tags', 'name')
    .populate('reactions.user', 'name');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const postObj = post.toObject({ virtuals: true });
  postObj.reactionCounts = post.getReactionCounts();
  postObj.userReactions = {
    like: post.hasUserReacted(req.user.id, 'like'),
    fire: post.hasUserReacted(req.user.id, 'fire'),
    thumbsUp: post.hasUserReacted(req.user.id, 'thumbsUp'),
    dislike: post.hasUserReacted(req.user.id, 'dislike'),
    sad: post.hasUserReacted(req.user.id, 'sad'),
    cry: post.hasUserReacted(req.user.id, 'cry'),
    hardLaugh: post.hasUserReacted(req.user.id, 'hardLaugh'), // Add this line
    highFive: post.hasUserReacted(req.user.id, 'highFive')
  };
  // Group reactions by type with user info for easy display
  postObj.reactionsByType = {};
  Object.keys(reactionEmojis).forEach(type => {
    postObj.reactionsByType[type] = post.reactions
      .filter(r => r.type === type)
      .map(r => ({
        userId: r.user._id,
        username: r.user.name
      }));
  });

  res.status(200).json(postObj);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Post content is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user is the author of the post
  if (post.author.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this post');
  }

  // Check if post is still editable (within 30 minutes)
  const thirtyMinutesInMs = 30 * 60 * 1000;
  const timeDifference = Date.now() - post.createdAt.getTime();
  
  if (timeDifference > thirtyMinutesInMs) {
    res.status(403);
    throw new Error('Posts can only be edited within 30 minutes of creation');
  }

  // Extract user tags from updated content
  const taggedUsernames = content.match(/@([a-zA-Z0-9_]+)/g) || [];
  const tags = [];
  
  if (taggedUsernames.length > 0) {
    for (const tag of taggedUsernames) {
      const username = tag.substring(1); // Remove @ symbol
      const user = await User.findOne({ name: new RegExp(`^${username}$`, 'i') });
      
      if (user) {
        tags.push(user._id);
      }
    }
  }

  // Update post
  post.content = content;
  post.tags = tags;
  post.updatedAt = Date.now();
  
  await post.save();
  
  // Populate fields before sending response
  await post.populate('author', 'name');
  await post.populate('tags', 'name');

  const postObj = post.toObject({ virtuals: true });
  postObj.reactionCounts = post.getReactionCounts();

  res.status(200).json(postObj);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Admin or author)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user is admin or the author of the post
  if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await post.deleteOne();

  res.status(200).json({ message: 'Post deleted successfully' });
});

// @desc    Add a reaction to a post
// @route   POST /api/posts/:id/react
// @access  Private
const reactToPost = asyncHandler(async (req, res) => {
  const { type } = req.body;
  
  if (!['like', 'fire', 'thumbsUp', 'dislike', 'sad', 'cry', 'hardLaugh', 'highFive'].includes(type)) {
    res.status(400);
    throw new Error('Invalid reaction type');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user has already reacted with this type
  const existingReaction = post.reactions.find(
    reaction => reaction.user.toString() === req.user.id && reaction.type === type
  );

  if (existingReaction) {
    // Remove reaction if it already exists (toggle functionality)
    post.reactions = post.reactions.filter(
      reaction => !(reaction.user.toString() === req.user.id && reaction.type === type)
    );
  } else {
    // Add new reaction
    post.reactions.push({
      type,
      user: req.user.id
    });
  }

  await post.save();
  
  // Populate user data for reactions
  await post.populate('reactions.user', 'name');
  
  // Get updated reaction counts
  const reactionCounts = post.getReactionCounts();
  
  // Group reactions by type with user info
  const reactionsByType = {};
  Object.keys(reactionEmojis).forEach(type => {
    reactionsByType[type] = post.reactions
      .filter(r => r.type === type)
      .map(r => ({
        userId: r.user._id,
        username: r.user.name
      }));
  });
  
  res.status(200).json({ 
    message: existingReaction ? 'Reaction removed' : 'Reaction added',
    reactionCounts,
    reactionsByType,
    userReactions: {
        like: post.hasUserReacted(req.user.id, 'like'),
        fire: post.hasUserReacted(req.user.id, 'fire'),
        thumbsUp: post.hasUserReacted(req.user.id, 'thumbsUp'),
        dislike: post.hasUserReacted(req.user.id, 'dislike'),
        sad: post.hasUserReacted(req.user.id, 'sad'),
        cry: post.hasUserReacted(req.user.id, 'cry'),
        hardLaugh: post.hasUserReacted(req.user.id, 'hardLaugh'), // Add this line
        highFive: post.hasUserReacted(req.user.id, 'highFive')
      }
  });
});

// @desc    Vote on a poll option
// @route   POST /api/posts/:id/vote
// @access  Private
const voteOnPoll = asyncHandler(async (req, res) => {
  const { optionId } = req.body;
  
  if (!optionId) {
    res.status(400);
    throw new Error('Option ID is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (!post.isPoll) {
    res.status(400);
    throw new Error('This post is not a poll');
  }

  // Find the option
  const option = post.pollOptions.id(optionId);
  
  if (!option) {
    res.status(404);
    throw new Error('Poll option not found');
  }

  // Check if user has already voted on any option
  let hasVoted = false;
  let previousVote = null;

  for (const opt of post.pollOptions) {
    const voteIndex = opt.votes.findIndex(
      vote => vote.toString() === req.user.id
    );
    
    if (voteIndex !== -1) {
      hasVoted = true;
      previousVote = opt;
      // Remove previous vote
      opt.votes.splice(voteIndex, 1);
    }
  }

  // Add vote to the selected option
  option.votes.push(req.user.id);
  await post.save();

  // Prepare response
  const pollResults = post.pollOptions.map(opt => ({
    _id: opt._id,
    text: opt.text,
    voteCount: opt.votes.length
  }));

  res.status(200).json({
    message: hasVoted ? 'Vote updated' : 'Vote recorded',
    pollResults
  });
});

// @desc    Get count of unread posts for current user
// @route   GET /api/posts/unread/count
// @access  Private
const getUnreadPostsCount = asyncHandler(async (req, res) => {
  const count = await Post.countDocuments({
    readBy: { $ne: req.user.id },
    // Don't count user's own posts as unread
    author: { $ne: req.user.id }
  });
  
  res.status(200).json({ count });
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  reactToPost,
  voteOnPoll,
  getUnreadPostsCount
};