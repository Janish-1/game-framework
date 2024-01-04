// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection URL
    const MONGODB_URI = 'mongodb+srv://game_framework:RW5GvxLx8D4lqs3p@cluster0.qkvcvbo.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URL

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      dbName: "Game",
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
