// app.js
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const morgan = require("morgan");
const Routes = require("./routes/Routes");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const PORT = process.env.PORT || 3001;
const app = express();

// Security headers
app.use(helmet());

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth-specific rate limiter (tighter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts.' }
});
app.use('/register', authLimiter);
app.use('/login', authLimiter);
app.use('/otplogin', authLimiter);

// Create a write stream (in append mode) for the log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Use morgan for HTTP request logging
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Login and Register
app.post("/register", Routes);
app.post("/login", Routes);
app.post("/logout", Routes);

// OTP System
app.post("/newotp", Routes);
app.post("/verifyotp", Routes);
app.post("/otplogin", Routes);

// Money System
app.post("/addcoin", Routes);
app.post("/removecoin", Routes);
app.post("/approvetransaction", Routes);
app.post("/declinetransaction", Routes);
app.post("/moneyreqsemail", Routes);
app.get("/moneyreqsall", Routes);
app.post("/moneyreqsobject", Routes);

// Player Data
app.get("/allusers", Routes);
app.get("/users/:id", Routes);
app.post("/users/email", Routes);
app.post("/updateusername", Routes);
app.post("/updatepassword", Routes);

// Reset Password
app.get("/generateresettoken", Routes);
app.get("/sendtokentoemail", Routes);
app.post("/resetpassword", Routes);

// Token System
app.post("/newtemptoken", Routes);

// Image System
app.post("/imageupload", Routes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server Status: OK — listening on port ${PORT}`);
});
