const Question = require('../models/Question');
const Prediction = require('../models/Prediction');
const { appendPredictionRow } = require('../services/googleSheetsService');

const listUserPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id }).select('matchId questionType selectedOption createdAt');
    return res.status(200).json({ predictions });
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

    const question = await Question.findById(questionId).select('options questionType');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (!question.options.includes(option)) {
      return res.status(400).json({ error: 'Selected option is not valid for this question' });
    }

    const questionType = question.questionType || 'match';

    const existingPrediction = await Prediction.findOne({
      userId: req.user._id,
      matchId: questionId,
      questionType,
    });

    if (existingPrediction) {
      return res.status(400).json({ error: 'Prediction already submitted' });
    }

    const prediction = await Prediction.create({
      userId: req.user._id,
      username: req.user.username,
      matchId: questionId,
      questionType,
      selectedOption: option,
    });

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

module.exports = { createPrediction, listUserPredictions };
