// models/user.js
const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
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
  temptoken: {
    type:String,
  },
  permtoken:{
    type:String,
  },
  otp:{
    type:Number,
  },
  pfp:{
    type:String,
    default: null,
  },
  money:{
    type:Number,
    default: 0,
  },
  resetToken:{
    type:String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  }
}, { collection: 'users' }); // Specify the collection name here

// Create a User model based on the schema
const User = mongoose.model('users', userSchema);

module.exports = User;
