const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true, trim: true, lowercase: true },
  matchId: { type: String, required: true, trim: true },
  questionType: { type: String, enum: ['toss', 'match'], default: 'match' },
  selectedOption: { type: String, required: true, trim: true },
  syncedToSheet: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prediction', predictionSchema);
