/**
 * Database configuration
 * This file contains the MongoDB connection setup
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    // Connect to MongoDB with the URI from environment variables
    
    // In Mongoose 7.x, the options useNewUrlParser and useUnifiedTopology are no longer needed
    // Using improved connection options for MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increased to 15 seconds timeout
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 30000, // Connection timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Stack trace:', error.stack);
    
    // Check for specific MongoDB Atlas connection issues
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('\nMongoDB Atlas Connection Error: Network connectivity issue detected.');
      console.error('Please check your internet connection and MongoDB Atlas configuration.');
    }
    
    throw error; // Propagate the error to be handled by the caller
  }
};

module.exports = connectDB;