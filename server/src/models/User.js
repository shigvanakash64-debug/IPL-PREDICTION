const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  identifier: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
