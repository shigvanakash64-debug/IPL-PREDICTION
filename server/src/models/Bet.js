const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, enum: [10, 20, 50, 100] },
  paymentStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bet', betSchema);
