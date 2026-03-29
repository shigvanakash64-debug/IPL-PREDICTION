const express = require('express');
const Question = require('../models/Question');
const Vote = require('../models/Vote');

const router = express.Router();

router.post('/vote', async (req, res) => {
  try {
    const { questionId, selectedOption, userIdentifier } = req.body;

    if (!questionId || !selectedOption || !userIdentifier) {
      return res.status(400).json({ message: 'questionId, selectedOption and userIdentifier are required.' });
    }

    const existingVote = await Vote.findOne({ questionId, userIdentifier });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this question.' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const vote = new Vote({ questionId, selectedOption, userIdentifier });
    await vote.save();

    if (selectedOption === 'A') {
      question.votesA += 1;
    } else {
      question.votesB += 1;
    }

    await question.save();

    res.json({
      votesA: question.votesA,
      votesB: question.votesB,
      totalVotes: question.votesA + question.votesB,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to cast vote' });
  }
});

router.get('/results/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const votesA = question.votesA;
    const votesB = question.votesB;
    const totalVotes = votesA + votesB;
    const percentA = totalVotes ? Math.round((votesA / totalVotes) * 100) : 0;
    const percentB = totalVotes ? Math.round((votesB / totalVotes) * 100) : 0;

    res.json({ votesA, votesB, totalVotes, percentA, percentB });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load results' });
  }
});

module.exports = router;
