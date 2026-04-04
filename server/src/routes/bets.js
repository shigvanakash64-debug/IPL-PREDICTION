const express = require('express');
const {
  createBet,
  listUserBets,
  confirmPayment,
  getBetById,
} = require('../controllers/betController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createBet);
router.post('/confirm-payment', confirmPayment);
router.get('/', listUserBets);
router.get('/:id', getBetById);

module.exports = router;
