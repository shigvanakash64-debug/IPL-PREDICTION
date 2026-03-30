const express = require('express');
const { submitRequest } = require('../controllers/requestController');
const { uploadSingleScreenshot } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/request', uploadSingleScreenshot, submitRequest);

module.exports = router;
