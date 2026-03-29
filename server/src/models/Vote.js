const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  userIdentifier: { type: String, required: true, trim: true },
  selectedOption: {
    type: String,
    required: true,
    enum: ['A', 'B'],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vote', voteSchema);
