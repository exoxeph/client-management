/**
 * Authentication middleware
 * This middleware verifies the JWT token in the request header
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes - verifies the JWT token
 */
const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No token found in Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = decoded;

    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;


/**
 * Middleware to check if user is admin
 * Must be used after the protect middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };