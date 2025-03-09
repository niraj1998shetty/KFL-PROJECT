const express = require('express');
const router = express.Router();
const { 
  createSemifinalPrediction,
  updateSemifinalPrediction,
  getUserSemifinalPrediction,
  getAllSemifinalPredictions
} = require('../controllers/semifinalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSemifinalPrediction);
router.put('/', protect, updateSemifinalPrediction);
router.get('/me', protect, getUserSemifinalPrediction);
router.get('/all', protect, getAllSemifinalPredictions);

module.exports = router;