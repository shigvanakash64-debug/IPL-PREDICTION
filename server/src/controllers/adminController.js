const Question = require('../models/Question');
const Prediction = require('../models/Prediction');
const { parseISTDateTimeLocal, getNext630PMIST } = require('../utils/timeUtils');
const { syncApprovedPrediction } = require('../services/googleSheetsService');

const deriveQuestionTypeByText = (text) => {
  if (!text || typeof text !== 'string') return 'match';
  const normalized = text.toLowerCase();
  if (normalized.includes('toss')) return 'toss';
  if (normalized.includes('match')) return 'match';
  return 'match';
};

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

    const questionType = deriveQuestionTypeByText(text);
    const question = new Question({
      text: text.trim(),
      options: [option1.trim(), option2.trim()],
      cutoffTime: cutoffDate,
      questionType,
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
    const normalizedQuestions = questions.map((question) => {
      const questionType = question.questionType && ['toss', 'match'].includes(question.questionType)
        ? question.questionType
        : deriveQuestionTypeByText(question.text);
      const questionObj = question.toObject ? question.toObject() : question;
      return {
        ...questionObj,
        options: (questionObj.options || []).slice(0, 2),
        questionType,
      };
    });
    return res.status(200).json({ questions: normalizedQuestions });
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
    const { status, search } = req.query;
    const query = {};

    if (!status || status === 'pending') {
      query.paymentStatus = 'pending';
    } else if (status !== 'all') {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { _id: new RegExp(search, 'i') },
        { paymentNote: new RegExp(search, 'i') },
      ];
    }

    const predictions = await Prediction.find(query)
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

const approvePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    prediction.paymentStatus = 'paid';
    prediction.paymentNote = prediction.paymentNote || `PRED_${prediction._id}`;
    await prediction.save();

    const synced = await syncApprovedPrediction(prediction);
    return res.status(200).json({ success: true, prediction, sheetSynced: synced });
  } catch (error) {
    console.error('approvePrediction error:', error);
    return res.status(500).json({ error: 'Unable to approve prediction' });
  }
};

const rejectPrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    prediction.paymentStatus = 'rejected';
    await prediction.save();

    return res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('rejectPrediction error:', error);
    return res.status(500).json({ error: 'Unable to reject prediction' });
  }
};

module.exports = { createQuestion, getQuestions, deleteQuestion, listPredictions, updatePredictionStatus, approvePrediction, rejectPrediction };
