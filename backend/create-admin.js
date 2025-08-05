/**
 * Script to create an admin user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Admin user details
const adminUser = {
  email: 'admin@test.com',
  password: 'admin123',
  role: 'admin',
  accountType: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminUser.email });
      
      if (existingAdmin) {
        console.log(`Admin user with email ${adminUser.email} already exists`);
      } else {
        // Create admin user
        const newAdmin = await User.create(adminUser);
        console.log('Admin user created successfully:');
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Role: ${newAdmin.role}`);
        console.log(`Password: ${adminUser.password} (plaintext for testing only)`);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
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