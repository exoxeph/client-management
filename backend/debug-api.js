/**
 * Debug script to log API requests and responses
 */

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');

// Load environment variables
dotenv.config();

// Override PORT environment variable for this debug script
process.env.PORT = 5001;

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware for detailed request/response logging
app.use((req, res, next) => {
  console.log('\n--- INCOMING REQUEST ---');
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Capture the original send function
  const originalSend = res.send;
  
  // Override the send function to log the response
  res.send = function(body) {
    console.log('\n--- OUTGOING RESPONSE ---');
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.getHeaders());
    console.log('Body:', typeof body === 'string' ? body : JSON.stringify(body));
    
    // Call the original send function
    return originalSend.call(this, body);
  };
  
  next();
});

// Standard logging middleware
app.use(morgan('dev'));

// API routes
app.use('/api', routes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    
    // Start server
    const PORT = process.env.PORT || 5001; // Use a different port
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with database connection`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });