const express = require('express');
const { createPrediction, listUserPredictions } = require('../controllers/predictionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createPrediction);
router.get('/', listUserPredictions);

module.exports = router;
