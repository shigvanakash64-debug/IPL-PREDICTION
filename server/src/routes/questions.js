const express = require('express');
const { listQuestions } = require('../controllers/questionController');

const router = express.Router();

router.get('/', listQuestions);

module.exports = router;
