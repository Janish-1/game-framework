// app.js
const express = require('express');
const bodyParser = require("body-parser");
const connectDB = require('./config/database'); // Import database configuration
const Routes = require('./routes/Routes');
const path = require('path');
const multer = require('multer'); 
const User = require('./models/user');
const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');

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

app.use(bodyParser.json());

// Connect to MongoDB
connectDB(); // Call the function to establish MongoDB connection

// Define multer storage and file upload settings
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use the helloRoutes for the /hello endpoint
app.post('/register',Routes);
app.post('/login',Routes);
app.post('/newotp',Routes);
app.post('/verifyotp',Routes);
app.post('/otplogin',Routes); 
app.post('/addcoin',Routes);
app.post('/removecoin',Routes);
app.post('/approvetransaction',Routes);
app.post('/declinetransaction',Routes);
app.post('/moneyreqsemail',Routes);
app.get('/moneyreqsall',Routes);
app.post('/moneyreqsobject',Routes);
app.get('/allusers', Routes);
app.get('/users/:id', Routes);
app.post('/users/email', Routes);
app.post('/imageupload',Routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
