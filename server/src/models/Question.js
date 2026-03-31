const mongoose = require('mongoose');
const { getNext630PMIST } = require('../utils/timeUtils');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  questionType: { type: String, enum: ['toss', 'match'], default: 'match' },
  cutoffTime: { type: Date, default: getNext630PMIST },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
