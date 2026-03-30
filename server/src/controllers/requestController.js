const crypto = require('crypto');
const { appendRequestRow } = require('../services/googleSheetsService');

const submitRequest = async (req, res) => {
  try {
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ message: 'Name and amount are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot file is required' });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const requestId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();

    await appendRequestRow({
      id: requestId,
      name: name.trim(),
      amount: numericAmount,
      screenshotUrl,
      status: 'PENDING',
      timestamp,
    });

    return res.status(201).json({ message: 'Request submitted for approval' });
  } catch (error) {
    console.error('submitRequest error:', error);
    return res.status(500).json({ message: 'Unable to submit request', error: error.message });
  }
};

module.exports = { submitRequest };
