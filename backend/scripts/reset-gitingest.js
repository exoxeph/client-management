/**
 * reset-gitingest.js
 * 
 * This script connects to your MongoDB database and resets the 'codebase'
 * field for all documents in the 'projects' collection.
 * 
 * This allows you to re-test the Gitingest ingestion feature on existing projects
 * without having to create new ones.
 * 
 * How to run:
 * 1. Make sure your backend server is NOT running.
 * 2. Open a terminal in your /backend directory.
 * 3. Run the command: node reset-gitingest.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (like your MONGO_URI)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Import your Project model
const Project = require('../models/Project');

const resetGitingestData = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env file. Please make sure it is set.');
        return;
    }

    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully.');

        console.log('\nFinding projects with existing codebase data...');

        // The update operation to perform.
        // We will use $unset to completely remove the 'codebase' field.
        // Mongoose will automatically re-add it with its default values
        // the next time the document is saved.
        const updateOperation = {
                $set: {
                    'codebase.repoUrl': null,
                    'codebase.ingestionStatus': 'none',
                    'codebase.lastSyncedAt': null,
                    'codebase.weaviateClass': null
                }
            };

        // Find all projects that have the codebase field set
        const projectsToUpdate = await Project.find({ 'codebase': { $exists: true } });

        if (projectsToUpdate.length === 0) {
            console.log('✅ No projects with codebase data found. Nothing to do.');
        } else {
            console.log(`Found ${projectsToUpdate.length} projects to reset. Updating now...`);
            
            // Perform the update on all documents in the collection
            const result = await Project.updateMany({}, updateOperation);

            console.log('✅ Update complete.');
            console.log(`   - Documents matched: ${result.matchedCount}`);
            console.log(`   - Documents modified: ${result.modifiedCount}`);
        }

    } catch (error) {
        console.error('❌ An error occurred during the reset process:', error);
    } finally {
        // Ensure we always disconnect from the database
        await mongoose.disconnect();
        console.log('\nMongoDB connection closed.');
    }
};

// Run the script
resetGitingestData();