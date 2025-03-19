const express = require('express');
const router = express.Router();
const { 
  createSemifinalPrediction,
  isEditingAllowed,
  updateSemifinalPrediction,
  getUserSemifinalPrediction,
  getAllSemifinalPredictions
} = require('../controllers/semifinalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSemifinalPrediction);
router.put('/', protect, updateSemifinalPrediction);
router.get('/me', protect, getUserSemifinalPrediction);
router.get('/all', protect, getAllSemifinalPredictions);
router.get('/editing-allowed', protect, isEditingAllowed);

module.exports = router;
