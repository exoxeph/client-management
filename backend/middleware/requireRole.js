/**
 * Role-based access control middleware
 * This middleware checks if a user has one of the specified roles
 */

/**
 * Middleware to check if user has one of the specified roles
 * Must be used after the protect middleware
 * @param {string|string[]} roles - The role(s) to check for
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Convert single role to array for consistent handling
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: `Not authorized. Required roles: ${allowedRoles.join(', ')}` });
  }
};

module.exports = requireRole;