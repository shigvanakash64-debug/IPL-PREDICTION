const express = require('express');
const {
  createPrediction,
  listUserPredictions,
  updatePredictionAmount,
  confirmPredictionPayment,
  getPredictionById,
} = require('../controllers/predictionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createPrediction);
router.get('/', listUserPredictions);
router.get('/:id', getPredictionById);
router.patch('/:id/amount', updatePredictionAmount);
router.patch('/:id/confirm', confirmPredictionPayment);

module.exports = router;
