/**
 * Main server file for the MERN application
 * This file sets up the Express server and connects to MongoDB
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Import middleware
const requestLogger = require('./middleware/requestLogger');

// Middleware
// Request logger should be the first middleware in the stack
app.use(requestLogger);

// Configure CORS properly
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const indexRoutes = require('./routes/index');

// Routes
app.use('/api', indexRoutes);
app.use('/api/documents', require('./routes/document.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB and start server

// Set a timeout for MongoDB connection attempt
const connectWithTimeout = () => {
  return new Promise((resolve, reject) => {
    // Set a 20-second timeout for connection attempt (increased from 10 seconds)
    const timeoutId = setTimeout(() => {
      reject(new Error('MongoDB connection timeout after 20 seconds'));
    }, 20000);

    connectDB()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

// Try to connect to MongoDB, but continue if it fails
connectWithTimeout()
  .then(() => {
    console.log('MongoDB Connected Successfully');
    startServer(true);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    
    // Provide helpful error message for MongoDB Atlas connection issues
    if (err.message.includes('whitelist') || err.name === 'MongooseServerSelectionError') {
      console.error('\nMongoDB Atlas Connection Error: It appears your IP address is not whitelisted.');
      console.error('Please follow these steps to fix the issue:');
      console.error('1. Log in to your MongoDB Atlas account');
      console.error('2. Go to Network Access in the Security section');
      console.error('3. Click "Add IP Address" and either add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0) for testing');
      console.error('4. Click "Confirm" and wait for the changes to be applied');
      console.error('5. Restart this server\n');
    }
    
    startServer(false);
  });

// Function to start the server
function startServer(dbConnected) {
  app.listen(PORT, () => {
    const connectionStatus = dbConnected ? 'with database connection' : '(without database connection)';
    console.log(`Server running on port ${PORT} ${connectionStatus}`);
    console.log(`API is available at http://localhost:${PORT}/api`);
    
    if (!dbConnected) {
      console.log('Note: API functionality that requires database access will not work');
    }
  });
}