// models/user.js
const mongoose = require('mongoose');

// Define the User Schema
const moneySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type:String,
    required: true,
  },
  amount: {
    type:Number,
    required:true,
  },
  status: {
    type: String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  }
}, { collection: 'moneyrequests' }); // Specify the collection name here

// Create a User model based on the schema
const MoneyRequests = mongoose.model('moneyrequests', moneySchema);

module.exports = MoneyRequests;
