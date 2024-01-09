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

// Route to handle file upload to Cloudinary and update user's data
app.post('/profileIMG', upload.single('image'), async (req, res) => {
  try {
    const file = req.file; // Access the uploaded file from req.file

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ responseCode: 401, success: false, responseMessage: 'Unauthorized - Bearer token not found' });
    }

    const token = authHeader.split(' ')[1]; // Extracting the token part from the header

    if (!file) {
      return res.status(400).json({ responseCode: 400, success: false, responseMessage: 'No file uploaded' });
    }

    // Convert the buffer to a base64 data URL
    const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: 'auto',
    });

    const imageUrl = result.secure_url;

    // Update the user's profile picture URL in the User table based on the token
    const updatedUser = await User.findOneAndUpdate(
      { permtoken: token },
      { pfp: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ responseCode: 404, success: false, responseMessage: 'User not found' });
    }

    res.status(200).json({ responseCode: 200, success: true, url: imageUrl, responseMessage: 'Profile image uploaded and user updated successfully' });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      success: false,
      responseMessage: 'Error uploading file to Cloudinary or updating user data',
      error: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
