// app.js
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/database"); // Import database configuration
const morgan = require("morgan"); // Import morgan for logging
const Routes = require("./routes/Routes");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fs = require("fs");

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

require("dotenv").config(); // Load environment variables from .env file

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const PORT = 3001;
const app = express();

// Create a write stream (in append mode) for the log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Use morgan for logging with combined format
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

// Connect to MongoDB
connectDB(); // Call the function to establish MongoDB connection

// Login and Register
app.post("/register", Routes);
app.post("/login", Routes);
app.post("/logout",Routes);

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
app.post("/updateusername",Routes);
app.post("/updatepassword",Routes);

// Reset Password
app.get("/generateresettoken",Routes);
app.get("/sendtokentoemail",Routes);
app.post("/resetpassword",Routes);

// Token System
app.post("/newtemptoken",Routes);

// Image System
app.post("/imageupload", Routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server Status: OK`);
});
