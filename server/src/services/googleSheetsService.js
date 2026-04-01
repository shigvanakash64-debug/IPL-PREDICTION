const https = require('https');
const { URL } = require('url');
const { google } = require('googleapis');

const loadCredentials = () => {
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!rawCredentials) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable');
  }

  try {
    return JSON.parse(rawCredentials);
  } catch {
    const decoded = Buffer.from(rawCredentials, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }
};

const getSheetsClient = async () => {
  const credentials = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const appendRequestRow = async ({ id, name, amount, screenshotUrl, status, timestamp }) => {
  const spreadsheetId = process.env.REQUEST_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Missing REQUEST_SHEET_ID environment variable');
  }

  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'REQUESTS!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id, name, amount, screenshotUrl, status, timestamp]],
    },
  });
};

const fetchRequestRows = async () => {
  const spreadsheetId = process.env.REQUEST_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Missing REQUEST_SHEET_ID environment variable');
  }

  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'REQUESTS!A:F',
  });

  const rows = response.data.values || [];
  if (!rows.length) {
    return [];
  }

  const [firstRow, ...dataRows] = rows;
  const hasHeader =
    firstRow[0] === 'ID' &&
    firstRow[1] === 'Name' &&
    firstRow[2] === 'Amount' &&
    firstRow[3] === 'Screenshot' &&
    firstRow[4] === 'Status' &&
    firstRow[5] === 'Timestamp';

  const rowsToParse = hasHeader ? dataRows : rows;

  return rowsToParse.map((row) => ({
    id: row[0] || '',
    name: row[1] || '',
    amount: row[2] || '',
    screenshotUrl: row[3] || '',
    status: row[4] || '',
    timestamp: row[5] || '',
  }));
};

const appendPredictionRow = async ({ username, matchId, questionType, selectedOption, timestamp }) => {
  const spreadsheetId = process.env.PREDICTION_SHEET_ID;
  if (!spreadsheetId) {
    console.warn('Missing PREDICTION_SHEET_ID environment variable. Skipping Google Sheets sync.');
    return false;
  }

  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'PREDICTIONS!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, username, matchId, questionType, selectedOption]],
      },
    });

    return true;
  } catch (error) {
    console.error('appendPredictionRow error:', error.message || error);
    return false;
  }
};

const postJsonToWebhook = async (webhookUrl, payload) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(webhookUrl);
      const body = JSON.stringify(payload);
      const requestOptions = {
        method: 'POST',
        hostname: parsedUrl.hostname,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const request = https.request(requestOptions, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            return resolve(true);
          }
          return reject(new Error(`Webhook sync failed with status ${response.statusCode}: ${responseBody}`));
        });
      });

      request.on('error', (err) => reject(err));
      request.write(body);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
};

const syncApprovedPrediction = async ({ username, questionType, selectedOption, amount, _id, paymentNote, paymentStatus }) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable. Skipping approved payment sync.');
    return false;
  }

  const payload = {
    username,
    questionType,
    selectedOption,
    amount,
    predictionId: _id,
    note: paymentNote || `PRED_${_id}`,
    status: paymentStatus || 'paid',
  };

  try {
    await postJsonToWebhook(webhookUrl, payload);
    return true;
  } catch (error) {
    console.error('syncApprovedPrediction error:', error.message || error);
    return false;
  }
};

module.exports = { appendRequestRow, fetchRequestRows, appendPredictionRow, syncApprovedPrediction };
