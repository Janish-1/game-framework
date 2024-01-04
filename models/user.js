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
    unique:true,
  },
  permtoken:{
    type:String,
    unique:true,
  },
  otp:{
    type:Number,
    unique:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'users' }); // Specify the collection name here

// Create a User model based on the schema
const User = mongoose.model('users', userSchema);

module.exports = User;
