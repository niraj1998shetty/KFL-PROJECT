const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const WhitelistedNumber = require('../models/WhitelistedNumber');
const config = require('../config/config');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, mobile, password } = req.body;

  // Check if mobile number already exists
  const userExists = await User.findOne({ mobile });

  if (userExists) {
    res.status(400);
    throw new Error('User with this mobile number already exists');
  }

  // Check if mobile number is in the whitelist
  const whitelistedNumber = await WhitelistedNumber.findOne({ mobile });

  if (!whitelistedNumber) {
    res.status(403);
    throw new Error('This mobile number is not authorized to register');
  }

  // Create user
  const user = await User.create({
    name,
    mobile,
    password
  });

  if (user) {
    // Update the whitelist to mark this number as registered
    whitelistedNumber.isRegistered = true;
    await whitelistedNumber.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      points: user.points,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;

  // Check for user with mobile number
  const user = await User.findOne({ mobile }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid mobile number or password');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid mobile number or password');
  }

  res.json({
    _id: user._id,
    name: user.name,
    mobile: user.mobile,
    points: user.points,
    isAdmin: user.isAdmin,
    token: generateToken(user._id)
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    mobile: user.mobile,
    points: user.points,
    isAdmin: user.isAdmin
  });
}); 

// @desc    Get all users
// @route   GET /api/auth/allUsers
// @access  Private
const allUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.status(200).json(users);
});

// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  // Check if user exists
  const user = await User.findOne({ mobile });

  if (!user) {
    res.status(404);
    throw new Error('User with this mobile number not found');
  }

  // Generate reset token (6 digit code for SMS)
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the token before storing
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set reset token and expiration time (30 minutes)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  await user.save();

  // In a real application, you would send this via SMS
  // For now, we'll return it (in production, remove this and use SMS service)
  res.status(200).json({
    success: true,
    message: 'Password reset code sent to your registered mobile number',
    // Only for development - remove in production
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
  });
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { mobile, resetToken, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!mobile || !resetToken || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Find user
  const user = await User.findOne({ mobile });

  if (!user) {
    res.status(404);
    throw new Error('User with this mobile number not found');
  }

  // Hash the provided token and compare
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Check if token is valid and not expired
  if (user.resetPasswordToken !== hashedToken || !user.resetPasswordExpire || Date.now() > user.resetPasswordExpire) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.'
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  allUsers,
  forgotPassword,
  resetPassword
};