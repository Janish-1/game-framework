// app.js
const express = require('express');
const bodyParser = require("body-parser");
const connectDB = require('./config/database'); // Import database configuration
const app = express();
const Routes = require('./routes/Routes');
const PORT = 3001;
app.use(bodyParser.json());

// Connect to MongoDB
connectDB(); // Call the function to establish MongoDB connection

// Use the helloRoutes for the /hello endpoint
app.post('/register',Routes);
app.post('/login',Routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
