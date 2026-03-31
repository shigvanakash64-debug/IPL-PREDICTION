const express = require('express');
const { listQuestions, getQuestion } = require('../controllers/questionController');

const router = express.Router();

router.get('/', listQuestions);
router.get('/:id', getQuestion);

module.exports = router;
