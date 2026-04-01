const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  deleteQuestion,
  listPredictions,
  updatePredictionStatus,
  approvePrediction,
  rejectPrediction,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.post('/question', createQuestion);
router.get('/questions', getQuestions);
router.delete('/question/:id', deleteQuestion);
router.get('/predictions', listPredictions);
router.patch('/predictions/:id/approve', approvePrediction);
router.patch('/predictions/:id/reject', rejectPrediction);
router.patch('/predictions/:id/status', updatePredictionStatus);

module.exports = router;
