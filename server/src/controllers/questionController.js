const Question = require('../models/Question');

const listQuestions = async (req, res) => {
  try {
    const questions = await Question.find().select('text options createdAt');
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('listQuestions error:', error);
    return res.status(500).json({ error: 'Unable to load questions' });
  }
};

module.exports = { listQuestions };
