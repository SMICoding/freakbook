const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    expires: 432000,
    default: Date.now
  }
});

module.exports = Token = mongoose.model('Token', TokenSchema);
