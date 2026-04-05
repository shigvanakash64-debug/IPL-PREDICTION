const Question = require('../models/Question');
const Bet = require('../models/Bet');

const listUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id })
      .select('questionId selectedOption amount paymentStatus createdAt')
      .populate('questionId', 'text')
      .lean();

    const betsWithDetails = bets.map((bet) => ({
      ...bet,
      questionText: bet.questionId ? bet.questionId.text : '',
    }));

    return res.status(200).json({ bets: betsWithDetails });
  } catch (error) {
    console.error('listUserBets error:', error);
    return res.status(500).json({ error: 'Unable to load user bets' });
  }
};

const createBet = async (req, res) => {
  try {
    const { questionId, selectedOption, amount } = req.body;

    if (!questionId || !selectedOption || !amount) {
      return res.status(400).json({ error: 'Question ID, selected option, and amount are required' });
    }

    const validAmounts = [10, 20, 50, 100];
    if (!validAmounts.includes(amount)) {
      return res.status(400).json({ error: 'Invalid amount. Must be 10, 20, 50, or 100' });
    }

    const question = await Question.findById(questionId).select('options status');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.status !== 'active') {
      return res.status(403).json({ error: 'Question is not active' });
    }

    if (!question.options.includes(selectedOption)) {
      return res.status(400).json({ error: 'Selected option is not valid' });
    }

    // Rate limiting: prevent creating bets too quickly (within 5 seconds)
    const recentBet = await Bet.findOne({
      userId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 5000) }
    });
    if (recentBet) {
      return res.status(429).json({ error: 'Please wait a few seconds before placing another bet' });
    }

    // Prevent duplicate bets per user per question
    const existingBet = await Bet.findOne({
      userId: req.user._id,
      questionId,
    });

    if (existingBet) {
      return res.status(400).json({ error: 'You have already placed a bet on this question' });
    }

    const bet = await Bet.create({
      userId: req.user._id,
      questionId,
      selectedOption,
      amount,
      paymentStatus: 'pending',
    });

    return res.status(201).json({ success: true, bet });
  } catch (error) {
    console.error('createBet error:', error);
    return res.status(500).json({ error: 'Unable to create bet' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    // Assuming this is called after user clicks "I have paid"
    // But since bet is already pending, perhaps this is not needed
    // Or use it to update something, but for now, just return success
    return res.status(200).json({ success: true, message: 'Payment confirmation noted' });
  } catch (error) {
    console.error('confirmPayment error:', error);
    return res.status(500).json({ error: 'Unable to confirm payment' });
  }
};

const getBetById = async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('questionId', 'text options status');
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    return res.status(200).json({ bet });
  } catch (error) {
    console.error('getBetById error:', error);
    return res.status(500).json({ error: 'Unable to load bet' });
  }
};

module.exports = {
  listUserBets,
  createBet,
  confirmPayment,
  getBetById,
};
