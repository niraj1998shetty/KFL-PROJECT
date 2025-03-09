const express = require('express');
const router = express.Router();
const { 
  addWhitelistedNumber,
  getWhitelistedNumbers,
  deleteWhitelistedNumber,
  bulkAddWhitelistedNumbers
} = require('../controllers/whitelistController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin privileges
router.use(protect, admin);

router.route('/')
  .get(getWhitelistedNumbers)
  .post(addWhitelistedNumber);

router.route('/bulk')
  .post(bulkAddWhitelistedNumbers);

router.delete('/:id', deleteWhitelistedNumber);

module.exports = router;