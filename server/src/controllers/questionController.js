const Question = require('../models/Question');
const { getNext630PMIST, isAfterIST } = require('../utils/timeUtils');

const deriveQuestionTypeByText = (text) => {
  if (!text || typeof text !== 'string') return 'match';
  const normalized = text.toLowerCase();
  if (normalized.includes('toss')) return 'toss';
  if (normalized.includes('match')) return 'match';
  return 'match';
};

const normalizeQuestion = (question) => {
  const safeQuestion = question.toObject ? question.toObject() : question;
  const cutoffTime = safeQuestion.cutoffTime || getNext630PMIST();
  const questionType = safeQuestion.questionType && ['toss', 'match'].includes(safeQuestion.questionType)
    ? safeQuestion.questionType
    : deriveQuestionTypeByText(safeQuestion.text);
  return {
    ...safeQuestion,
    questionType,
    cutoffTime,
    status: isAfterIST(cutoffTime) ? 'Closed' : 'Open',
  };
};

const listQuestions = async (req, res) => {
  try {
    const questions = await Question.find().select('text options questionType cutoffTime createdAt');
    return res.status(200).json({ questions: questions.map(normalizeQuestion) });
  } catch (error) {
    console.error('listQuestions error:', error);
    return res.status(500).json({ error: 'Unable to load questions' });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('text options questionType cutoffTime createdAt');
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json({ question: normalizeQuestion(question) });
  } catch (error) {
    console.error('getQuestion error:', error);
    return res.status(500).json({ error: 'Unable to load question' });
  }
};

module.exports = { listQuestions, getQuestion };
