const express = require('express');
const router = express.Router();
const { 
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  reactToPost,
  voteOnPoll,
  getUnreadPostsCount // Add this new import
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Basic post routes
router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/unread/count', protect, getUnreadPostsCount); // Add this new route
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Reaction and voting routes
router.post('/:id/react', protect, reactToPost);
router.post('/:id/vote', protect, voteOnPoll);

module.exports = router;