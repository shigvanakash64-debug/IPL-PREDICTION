const Question = require('../models/Question');
const { getNext630PMIST, isAfterIST } = require('../utils/timeUtils');

const listQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ status: 'active' }).select('text options pools status createdAt');
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('listQuestions error:', error);
    return res.status(500).json({ error: 'Unable to load questions' });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('text options pools status createdAt');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json({ question });
  } catch (error) {
    console.error('getQuestion error:', error);
    return res.status(500).json({ error: 'Unable to load question' });
  }
};

module.exports = { listQuestions, getQuestion };
