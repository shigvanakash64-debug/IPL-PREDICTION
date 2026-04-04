const Question = require('../models/Question');
const Bet = require('../models/Bet');
const User = require('../models/User');

const createQuestion = async (req, res) => {
  try {
    const { text, optionA, optionB } = req.body;

    if (!text || !optionA || !optionB) {
      return res.status(400).json({ error: 'Question text and two options are required' });
    }

    const options = [optionA.trim(), optionB.trim()];

    const question = new Question({
      text: text.trim(),
      options,
      createdBy: req.user._id,
    });
    await question.save();

    return res.status(201).json({ question });
  } catch (error) {
    console.error('createQuestion error:', error);
    return res.status(500).json({ error: 'Unable to create question' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('createdBy', 'name username');
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('getQuestions error:', error);
    return res.status(500).json({ error: 'Unable to load questions' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await question.deleteOne();
    return res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    console.error('deleteQuestion error:', error);
    return res.status(500).json({ error: 'Unable to delete question' });
  }
};

const listBets = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (!status || status === 'pending') {
      query.paymentStatus = 'pending';
    } else if (status !== 'all') {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { _id: new RegExp(search, 'i') },
      ];
    }

    const bets = await Bet.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name username')
      .populate('questionId', 'text');

    return res.status(200).json({ bets });
  } catch (error) {
    console.error('listBets error:', error);
    return res.status(500).json({ error: 'Unable to load bets' });
  }
};

const approveBet = async (req, res) => {
  try {
    const { id } = req.params;
    const bet = await Bet.findById(id).populate('questionId');
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    if (bet.paymentStatus === 'approved') {
      return res.status(400).json({ error: 'Bet already approved' });
    }

    bet.paymentStatus = 'approved';
    await bet.save();

    // Update pool counts
    const question = bet.questionId;
    const amountStr = bet.amount.toString();
    const optionIndex = question.options.indexOf(bet.selectedOption);
    if (optionIndex === 0) {
      question.pools[amountStr].optionA_count += 1;
    } else if (optionIndex === 1) {
      question.pools[amountStr].optionB_count += 1;
    }
    await question.save();

    return res.status(200).json({ success: true, bet });
  } catch (error) {
    console.error('approveBet error:', error);
    return res.status(500).json({ error: 'Unable to approve bet' });
  }
};

const rejectBet = async (req, res) => {
  try {
    const { id } = req.params;
    const bet = await Bet.findById(id);
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    bet.paymentStatus = 'rejected';
    await bet.save();

    return res.status(200).json({ success: true, bet });
  } catch (error) {
    console.error('rejectBet error:', error);
    return res.status(500).json({ error: 'Unable to reject bet' });
  }
};

module.exports = { createQuestion, getQuestions, deleteQuestion, listBets, approveBet, rejectBet };
