const crypto = require('crypto');
const { appendRequestRow, fetchRequestRows } = require('../services/googleSheetsService');

const submitRequest = async (req, res) => {
  try {
    const { name, amount } = req.body;

    if (!name || !amount || !req.file) {
      return res.status(400).json({ error: 'Missing fields: name, amount, and screenshot are required' });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const screenshotUrl = req.file && req.file.path;
    if (!screenshotUrl) {
      return res.status(500).json({ error: 'Unable to upload screenshot' });
    }
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

const getRequests = async (req, res) => {
  try {
    const rows = await fetchRequestRows();
    return res.status(200).json({ requests: rows });
  } catch (error) {
    console.error('getRequests error:', error);
    return res.status(500).json({ message: 'Unable to fetch requests', error: error.message });
  }
};

module.exports = { submitRequest, getRequests };
