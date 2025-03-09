const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
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

module.exports = {
  registerUser,
  loginUser,
  getMe,
  allUsers
};