// models/moneyreqs.js
const mongoose = require('mongoose');

// Define the MoneyRequests Schema
const moneySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  }
}, { collection: 'moneyrequests' });

const MoneyRequests = mongoose.model('moneyrequests', moneySchema);

module.exports = MoneyRequests;
