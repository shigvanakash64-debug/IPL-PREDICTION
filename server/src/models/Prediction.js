const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: String, required: true, trim: true },
  selectedTeam: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
