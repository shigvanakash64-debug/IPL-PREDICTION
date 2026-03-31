const Question = require('../models/Question');
const Prediction = require('../models/Prediction');
const { parseISTDateTimeLocal, getNext630PMIST } = require('../utils/timeUtils');

const createQuestion = async (req, res) => {
  try {
    const { text, option1, option2, cutoffTime } = req.body;
    if (!text || !option1 || !option2) {
      return res.status(400).json({ error: 'Question text and two options are required' });
    }

    const cutoffDate = cutoffTime ? parseISTDateTimeLocal(cutoffTime) : getNext630PMIST();
    if (!cutoffDate) {
      return res.status(400).json({ error: 'Invalid cutoff time' });
    }

    const question = new Question({
      text: text.trim(),
      options: [option1.trim(), option2.trim()],
      cutoffTime: cutoffDate,
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

const listPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .select('userId username matchId questionType selectedOption amount paymentStatus paymentNote createdAt');

    return res.status(200).json({ predictions });
  } catch (error) {
    console.error('listPredictions error:', error);
    return res.status(500).json({ error: 'Unable to load predictions' });
  }
};

const updatePredictionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['paid', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    prediction.paymentStatus = status;
    await prediction.save();

    return res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('updatePredictionStatus error:', error);
    return res.status(500).json({ error: 'Unable to update prediction status' });
  }
};

module.exports = { createQuestion, getQuestions, deleteQuestion, listPredictions, updatePredictionStatus };
