/**
 * Request Logger Middleware
 * This middleware logs method, URL, status, and user id/role for API requests
 */

const requestLogger = (req, res, next) => {
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override res.json to capture the response status
  res.json = function(data) {
    // Get user info if available
    const userId = req.user ? req.user.id : 'unauthenticated';
    const userRole = req.user ? req.user.role : 'none';
    
    // Log the request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${userId} (${userRole})`);
    
    // Call the original json method
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = requestLogger;