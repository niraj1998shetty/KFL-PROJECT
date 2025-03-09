const asyncHandler = require('express-async-handler');
const WhitelistedNumber = require('../models/WhitelistedNumber');

// @desc    Add a new whitelisted number
// @route   POST /api/whitelist
// @access  Private/Admin
const addWhitelistedNumber = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  // Check if the number is already whitelisted
  const exists = await WhitelistedNumber.findOne({ mobile });
  
  if (exists) {
    res.status(400);
    throw new Error('This mobile number is already whitelisted');
  }

  const whitelistedNumber = await WhitelistedNumber.create({
    mobile,
    addedBy: req.user._id
  });

  res.status(201).json(whitelistedNumber);
});

// @desc    Get all whitelisted numbers
// @route   GET /api/whitelist
// @access  Private/Admin
const getWhitelistedNumbers = asyncHandler(async (req, res) => {
  const whitelistedNumbers = await WhitelistedNumber.find({});
  res.status(200).json(whitelistedNumbers);
});

// @desc    Delete a whitelisted number
// @route   DELETE /api/whitelist/:id
// @access  Private/Admin
const deleteWhitelistedNumber = asyncHandler(async (req, res) => {
  const whitelistedNumber = await WhitelistedNumber.findById(req.params.id);

  if (!whitelistedNumber) {
    res.status(404);
    throw new Error('Whitelisted number not found');
  }

  // Check if the number is already registered
  if (whitelistedNumber.isRegistered) {
    res.status(400);
    throw new Error('Cannot delete a number that has already registered');
  }

  await whitelistedNumber.remove();
  res.status(200).json({ id: req.params.id });
});

// @desc    Add multiple whitelisted numbers
// @route   POST /api/whitelist/bulk
// @access  Private/Admin
const bulkAddWhitelistedNumbers = asyncHandler(async (req, res) => {
  const { numbers } = req.body;
  
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of mobile numbers');
  }

  const results = {
    added: [],
    failed: []
  };

  // Validate all numbers first
  const validNumbers = numbers.filter(number => /^[6-9]\d{9}$/.test(number));
  const invalidNumbers = numbers.filter(number => !validNumbers.includes(number));
  
  invalidNumbers.forEach(number => {
    results.failed.push({
      mobile: number,
      reason: 'Invalid format'
    });
  });

  // Find existing numbers
  const existingNumbers = await WhitelistedNumber.find({
    mobile: { $in: validNumbers }
  }).select('mobile');
  
  const existingMobiles = existingNumbers.map(n => n.mobile);
  
  // Filter out numbers that already exist
  const newNumbers = validNumbers.filter(number => !existingMobiles.includes(number));
  
  existingMobiles.forEach(mobile => {
    results.failed.push({
      mobile,
      reason: 'Already whitelisted'
    });
  });

  // Create new whitelisted numbers
  if (newNumbers.length > 0) {
    const documentsToInsert = newNumbers.map(mobile => ({
      mobile,
      addedBy: req.user._id
    }));

    const insertedDocs = await WhitelistedNumber.insertMany(documentsToInsert);
    results.added = insertedDocs.map(doc => doc.mobile);
  }

  res.status(201).json(results);
});

module.exports = {
  addWhitelistedNumber,
  getWhitelistedNumbers,
  deleteWhitelistedNumber,
  bulkAddWhitelistedNumbers
};