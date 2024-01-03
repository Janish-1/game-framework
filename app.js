// app.js
const express = require('express');
const app = express();
const helloRoutes = require('./routes/helloRoutes');

// Use the helloRoutes for the /hello endpoint
app.use('/hello', helloRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
