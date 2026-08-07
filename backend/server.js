const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/api');
const { getDB } = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Beauty Salon Management Backend API is operational.' });
});

// Start Server after Database connection initialized
getDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Beauty Salon Backend Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
