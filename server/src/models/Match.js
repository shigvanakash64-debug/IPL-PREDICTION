const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true, trim: true },
  teamA: { type: String, required: true, trim: true },
  teamB: { type: String, required: true, trim: true },
  venue: { type: String, trim: true },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    required: true,
  },
  startTime: { type: Date, required: true },
  teamAVotes: { type: Number, default: 0 },
  teamBVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', matchSchema);
