const express = require('express');
const { createPrediction } = require('../controllers/predictionController');

const router = express.Router();
router.post('/:matchId', createPrediction);

module.exports = router;
