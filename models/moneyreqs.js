// models/user.js
const mongoose = require('mongoose');

// Define the User Schema
const moneySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  permtoken:{
    type:String,
  },
  money:{
    type:Number,
    default: 0,
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
