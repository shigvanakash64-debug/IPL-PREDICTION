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

module.exports = { appendRequestRow };
