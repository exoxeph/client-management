/**
 * Script to check for admin users in the database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' }).select('email role');
      
      if (adminUsers.length === 0) {
        console.log('No admin users found in the database');
      } else {
        console.log(`Found ${adminUsers.length} admin user(s):`);
        adminUsers.forEach((admin, index) => {
          console.log(`${index + 1}. Email: ${admin.email}, Role: ${admin.role}`);
        });
      }
    } catch (error) {
      console.error('Error finding admin users:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });