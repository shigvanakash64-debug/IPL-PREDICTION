const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { createQuestion, getQuestions, deleteQuestion } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.post('/question', createQuestion);
router.get('/questions', getQuestions);
router.delete('/question/:id', deleteQuestion);

module.exports = router;
