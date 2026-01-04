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

  // Generate a unique recovery code
  const generateRecoveryCode = () => {
    return crypto.randomBytes(9).toString('hex').toUpperCase().slice(0, 12);
  };

  let recoveryCode;
  let attempts = 0;

  // Ensure recovery code uniqueness
  do {
    recoveryCode = generateRecoveryCode();
    attempts++;
  } while (await User.findOne({ recoveryCode }) && attempts < 10);

  if (attempts >= 10) {
    res.status(500);
    throw new Error('Failed to generate unique recovery code');
  }

  // Create user
  const user = await User.create({
    name,
    mobile,
    password,
    recoveryCode
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

// @desc    Forgot password - Validate recovery code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { recoveryCode } = req.body;

  // Validate recovery code provided
  if (!recoveryCode || recoveryCode.trim() === '') {
    res.status(400);
    throw new Error('Please provide your recovery code');
  }

  // Check if user exists with this recovery code
  const user = await User.findOne({ recoveryCode: recoveryCode.toUpperCase().trim() });

  if (!user) {
    res.status(404);
    throw new Error('Invalid recovery code. Please contact the admin to get a new recovery code.');
  }

  res.status(200).json({
    success: true,
    message: 'Recovery code verified. You can now reset your password.',
    userId: user._id,
    mobile: user.mobile
  });
});

// @desc    Reset password with recovery code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!userId || !newPassword || !confirmPassword) {
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

  // Find user by ID
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update password
  user.password = newPassword;

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