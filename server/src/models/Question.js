const mongoose = require('mongoose');
const { getNext630PMIST } = require('../utils/timeUtils');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: {
    type: [{ type: String, required: true, trim: true }],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 2,
      message: 'A question must have exactly 2 options',
    },
  },
  questionType: { type: String, enum: ['toss', 'match'], default: 'match' },
  cutoffTime: { type: Date, default: getNext630PMIST },
  pools: {
    "10": {
      optionA_count: { type: Number, default: 0 },
      optionB_count: { type: Number, default: 0 }
    },
    "20": {
      optionA_count: { type: Number, default: 0 },
      optionB_count: { type: Number, default: 0 }
    },
    "50": {
      optionA_count: { type: Number, default: 0 },
      optionB_count: { type: Number, default: 0 }
    },
    "100": {
      optionA_count: { type: Number, default: 0 },
      optionB_count: { type: Number, default: 0 }
    }
  },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
