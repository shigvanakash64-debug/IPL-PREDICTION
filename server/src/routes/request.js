const express = require('express');
const { submitRequest, getRequests } = require('../controllers/requestController');
const { uploadSingleScreenshot } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/request', uploadSingleScreenshot, submitRequest);
router.get('/requests', getRequests);

module.exports = router;
