const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appName: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  }
});

module.exports = mongoose.model('Bot', BotSchema);
