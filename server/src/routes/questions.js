const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { question, optionA, optionB } = req.body;

    if (!question || !optionA || !optionB) {
      return res.status(400).json({ message: 'Question and both options are required.' });
    }

    const newQuestion = new Question({ question, optionA, optionB });
    await newQuestion.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create question' });
  }
});

router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load questions' });
  }
});

module.exports = router;
