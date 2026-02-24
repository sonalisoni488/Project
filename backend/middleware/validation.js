const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['seller', 'buyer'])
    .withMessage('Role must be either seller or buyer'),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Waste listing validation
const validateWasteListing = [
  body('wasteType')
    .isIn(['Plastic', 'Metal', 'Paper', 'Textile', 'E-waste', 'Construction', 'Glass', 'Organic'])
    .withMessage('Invalid waste type'),
  
  body('weight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Weight must be between 0.1 and 1000 kg'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  
  body('pickupAvailable')
    .optional()
    .isBoolean()
    .withMessage('Pickup available must be a boolean'),
  
  body('deliveryAvailable')
    .optional()
    .isBoolean()
    .withMessage('Delivery available must be a boolean'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('listingId')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'digital_wallet', 'on_delivery'])
    .withMessage('Invalid payment method'),
  
  body('pickupAddress')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Pickup address must be between 10 and 500 characters'),
  
  body('deliveryAddress')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Delivery address must be between 10 and 500 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('pickupDate')
    .optional()
    .isISO8601()
    .withMessage('Pickup date must be a valid date'),
  
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Review must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// User profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateWasteListing,
  validateTransaction,
  validateReview,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
};
