const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe,
  allUsers,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/allUsers', protect, allUsers);

module.exports = router;