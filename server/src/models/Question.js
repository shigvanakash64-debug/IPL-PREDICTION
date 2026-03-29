const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  optionA: { type: String, required: true, trim: true },
  optionB: { type: String, required: true, trim: true },
  votesA: { type: Number, default: 0 },
  votesB: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
