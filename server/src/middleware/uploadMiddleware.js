const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadsDirectory = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || '.png';
    const filename = `${Date.now()}-${(crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'))}${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadSingleScreenshot = (req, res, next) => {
  upload.single('screenshot')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = { uploadSingleScreenshot };
