const Question = require('../models/Question');
const Prediction = require('../models/Prediction');
const { appendPredictionRow } = require('../services/googleSheetsService');
const { isAfterIST, getNext630PMIST } = require('../utils/timeUtils');

const deriveQuestionTypeByText = (text) => {
  if (!text || typeof text !== 'string') return 'match';
  const normalized = text.toLowerCase();
  if (normalized.includes('toss')) return 'toss';
  if (normalized.includes('match')) return 'match';
  return 'match';
};

const listUserPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id })
      .select('matchId questionType selectedOption amount paymentStatus createdAt')
      .lean();

    const questionIds = predictions.map((prediction) => prediction.matchId).filter(Boolean);
    const questions = await Question.find({ _id: { $in: questionIds } }).select('text');
    const questionById = questions.reduce((map, question) => {
      map[question._id.toString()] = question;
      return map;
    }, {});

    const predictionsWithHistory = predictions.map((prediction) => {
      const question = questionById[prediction.matchId] || {};
      return {
        ...prediction,
        questionText: question.text || '',
        historyMessage:
          prediction.paymentStatus === 'paid'
            ? `You win this prediction between ${question.text || 'your selected match'}, amount - ${prediction.amount || 0}`
            : undefined,
      };
    });

    return res.status(200).json({ predictions: predictionsWithHistory });
  } catch (error) {
    console.error('listUserPredictions error:', error);
    return res.status(500).json({ error: 'Unable to load user predictions' });
  }
};

const createPrediction = async (req, res) => {
  try {
    const { questionId, option } = req.body;

    if (!questionId || !option) {
      return res.status(400).json({ error: 'Question ID and option are required' });
    }

    const question = await Question.findById(questionId).select('options questionType cutoffTime text');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const cutoffTime = question.cutoffTime || getNext630PMIST();
    if (isAfterIST(cutoffTime)) {
      return res.status(403).json({ error: 'Prediction cutoff has passed' });
    }

    const validOptions = (question.options || []).slice(0, 2);
    if (!validOptions.includes(option)) {
      return res.status(400).json({ error: 'Selected option is not valid for this question' });
    }

    const questionType = deriveQuestionTypeByText(question.text);

    const existingPrediction = await Prediction.findOne({
      userId: req.user._id,
      matchId: questionId,
      questionType,
    });

    if (existingPrediction) {
      existingPrediction.selectedOption = option;
      await existingPrediction.save();
      return res.status(200).json({ success: true, prediction: existingPrediction, updated: true });
    }

    const prediction = await Prediction.create({
      userId: req.user._id,
      username: req.user.username,
      matchId: questionId,
      questionType,
      selectedOption: option,
      paymentStatus: 'unpaid',
      paymentNote: `PRED_${new Date().getTime()}`,
    });

    prediction.paymentNote = `PRED_${prediction._id}`;
    await prediction.save();

    const synced = await appendPredictionRow({
      username: prediction.username,
      matchId: prediction.matchId,
      questionType: prediction.questionType,
      selectedOption: prediction.selectedOption,
      timestamp: prediction.createdAt,
    });

    if (synced) {
      prediction.syncedToSheet = true;
      await prediction.save();
    }

    return res.status(201).json({ success: true, prediction });
  } catch (error) {
    console.error('createPrediction error:', error);
    return res.status(500).json({ error: 'Unable to submit prediction' });
  }
};

const updatePredictionAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const prediction = await Prediction.findOne({ _id: id, userId: req.user._id });
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    const question = await Question.findById(prediction.matchId).select('cutoffTime');
    const cutoffTime = (question && question.cutoffTime) || getNext630PMIST();
    if (isAfterIST(cutoffTime)) {
      return res.status(403).json({ error: 'Prediction cutoff has passed' });
    }

    prediction.amount = numericAmount;
    prediction.paymentNote = prediction.paymentNote || `PRED_${prediction._id}`;
    await prediction.save();

    return res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('updatePredictionAmount error:', error);
    return res.status(500).json({ error: 'Unable to update payment amount' });
  }
};

const confirmPredictionPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findOne({ _id: id, userId: req.user._id });
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    const question = await Question.findById(prediction.matchId).select('cutoffTime');
    const cutoffTime = (question && question.cutoffTime) || getNext630PMIST();
    if (isAfterIST(cutoffTime)) {
      return res.status(403).json({ error: 'Prediction cutoff has passed' });
    }

    if (!prediction.amount || prediction.amount <= 0) {
      return res.status(400).json({ error: 'Amount must be set before confirming payment' });
    }

    prediction.paymentStatus = 'pending';
    prediction.paymentNote = prediction.paymentNote || `PRED_${prediction._id}`;
    await prediction.save();

    return res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('confirmPredictionPayment error:', error);
    return res.status(500).json({ error: 'Unable to confirm payment' });
  }
};

const getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    const question = await Question.findById(prediction.matchId).select('text options questionType cutoffTime');
    if (question) {
      const questionObj = question.toObject ? question.toObject() : question;
      questionObj.options = questionObj.options || [];
      return res.status(200).json({ prediction, question: questionObj });
    }
    return res.status(200).json({ prediction, question });
  } catch (error) {
    console.error('getPredictionById error:', error);
    return res.status(500).json({ error: 'Unable to load prediction' });
  }
};

module.exports = {
  createPrediction,
  listUserPredictions,
  updatePredictionAmount,
  confirmPredictionPayment,
  getPredictionById,
};
