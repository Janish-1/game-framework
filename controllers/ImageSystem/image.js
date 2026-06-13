// imageRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2;

// Define multer storage and file upload settings
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Route to handle file upload to Cloudinary and respond with the image URL
router.post('/imageupload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file; // Access the uploaded file from req.file

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

    // Respond with the image URL
    return res.status(200).json({ responseCode: 200, success: true, url: imageUrl, responseMessage: 'Image uploaded successfully' });
  } catch (error) {
    return res.status(500).json({
      responseCode: 500,
      success: false,
      responseMessage: 'Error uploading file to Cloudinary',
      error: error.message,
    });
  }
});

module.exports = router;
