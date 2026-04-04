const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  deleteQuestion,
  listBets,
  approveBet,
  rejectBet,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.post('/question', createQuestion);
router.get('/questions', getQuestions);
router.delete('/question/:id', deleteQuestion);
router.get('/bets', listBets);
router.patch('/bets/:id/approve', approveBet);
router.patch('/bets/:id/reject', rejectBet);

module.exports = router;
