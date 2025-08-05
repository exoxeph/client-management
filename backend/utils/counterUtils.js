/**
 * Counter Utilities
 * Functions for managing auto-incrementing counters
 */

const Counter = require('../models/Counter');

/**
 * Get the next sequence value for a given counter
 * @param {string} sequenceName - The name of the sequence counter
 * @returns {Promise<number>} - The next sequence value
 */
const getNextSequenceValue = async (sequenceName) => {
  try {
    // Find the sequence document and increment its value
    const sequenceDocument = await Counter.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    
    return sequenceDocument.sequence_value;
  } catch (error) {
    console.error(`Error getting next sequence value for ${sequenceName}:`, error);
    throw error;
  }
};

module.exports = {
  getNextSequenceValue
};