const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 JWT decoded:', decoded);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      console.log('🔍 User found:', user ? `${user.name} (${user.email})` : 'NULL');
      console.log('🔍 User ID from token:', decoded.id);
      console.log('🔍 User role:', user?.role);
      
      if (!user) {
        console.log('❌ User not found for ID:', decoded.id);
        return res.status(401).json({ 
          message: 'User not found.' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          message: 'Account has been deactivated.' 
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication.' 
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔍 Authorize check - User role:', req.user?.role);
    console.log('🔍 Authorize check - Required roles:', roles);
    console.log('🔍 Authorize check - User exists:', !!req.user);
    
    if (!req.user) {
      console.log('❌ No user in request for authorization');
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Role mismatch:', {
        userRole: req.user.role,
        requiredRoles: roles,
        authorized: roles.includes(req.user.role)
      });
      return res.status(403).json({ 
        message: `Access denied. ${req.user.role} role is not authorized.` 
      });
    }

    console.log('✅ Authorization passed for role:', req.user.role);
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource or is admin
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params.id || req.body[resourceField] || req.query[resourceField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};

// Rate limiting for auth endpoints
const createAuthRateLimit = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const loginRateLimit = createAuthRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many login attempts. Please try again later.'
);

const registerRateLimit = createAuthRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 registrations per hour
  'Too many registration attempts. Please try again later.'
);

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  loginRateLimit,
  registerRateLimit
};
