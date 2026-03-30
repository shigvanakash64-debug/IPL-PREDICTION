const Question = require('../models/Question');

const createQuestion = async (req, res) => {
  try {
    const { text, option1, option2 } = req.body;
    if (!text || !option1 || !option2) {
      return res.status(400).json({ error: 'Question text and two options are required' });
    }

    const question = new Question({
      text: text.trim(),
      options: [option1.trim(), option2.trim()],
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
    const questions = await Question.find().populate('createdBy', 'name email');
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

module.exports = { createQuestion, getQuestions, deleteQuestion };
