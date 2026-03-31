const express = require('express');
const { createPrediction, listUserPredictions, updatePredictionPayment } = require('../controllers/predictionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createPrediction);
router.patch('/:id/payment', updatePredictionPayment);
router.get('/', listUserPredictions);

module.exports = router;
