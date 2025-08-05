/**
 * Script to check for unverified corporate users in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Corporate = require('./models/Corporate');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Main function to check unverified users
const checkUnverifiedUsers = async () => {
  try {
    // Connect to the database
    const conn = await connectDB();
    
    console.log('\n--- Checking for unverified corporate users ---');
    
    // Find all unverified corporate users
    const users = await User.find({
      role: 'corporate',
      isVerified: false
    });
    
    console.log(`Found ${users.length} unverified corporate users:`);
    
    // Log each user
    for (const user of users) {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Account Type: ${user.accountType}`);
      console.log(`Profile Data ID: ${user.profileData}`);
      
      // Try to find the corporate profile
      if (user.profileData) {
        const profile = await Corporate.findById(user.profileData);
        if (profile) {
          console.log('Corporate profile found:');
          console.log(`Company Name: ${profile.companyName}`);
          console.log(`Company Email: ${profile.companyEmail}`);
        } else {
          console.log('Corporate profile NOT found!');
        }
      } else {
        console.log('No profile data reference!');
      }
    }
    
    // Try to directly populate the profileData
    console.log('\n--- Attempting to populate profileData ---');
    const populatedUsers = await User.find({
      role: 'corporate',
      isVerified: false
    }).populate('profileData');
    
    console.log(`Found ${populatedUsers.length} users after populate:`);
    for (const user of populatedUsers) {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Profile Data populated: ${user.profileData ? 'Yes' : 'No'}`);
      if (user.profileData) {
        console.log(`Company Name: ${user.profileData.companyName || 'N/A'}`);
      }
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Close the connection on error
    await mongoose.connection.close();
  }
};

// Run the function
checkUnverifiedUsers();