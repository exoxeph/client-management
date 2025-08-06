// Temporary script to check for documents in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Corporate = require('./models/Corporate');

async function checkDocuments() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Use a hardcoded MongoDB URI for testing
    // This is a placeholder - replace with your actual MongoDB URI
    const MONGO_URI = 'mongodb://localhost:27017/mern_corporate';
    console.log('Using MongoDB URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const corporates = await Corporate.find();
    console.log('Total corporate users:', corporates.length);
    
    if (corporates.length === 0) {
      console.log('No corporate users found');
      return;
    }
    
    corporates.forEach(doc => {
      console.log('-----------------------------------');
      console.log('ID:', doc._id);
      console.log('Company:', doc.companyName);
      console.log('Has business license file data:', !!doc.documents?.businessLicense?.fileData);
      console.log('Business license content type:', doc.documents?.businessLicense?.contentType);
      console.log('Business license file path:', doc.documents?.businessLicense?.filePath);
      console.log('Has tax document file data:', !!doc.documents?.taxDocument?.fileData);
      console.log('Tax document content type:', doc.documents?.taxDocument?.contentType);
      console.log('Tax document file path:', doc.documents?.taxDocument?.filePath);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDocuments();