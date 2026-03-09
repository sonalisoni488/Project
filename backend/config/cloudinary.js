const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration with fallback for demo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Debug: Show what credentials are being loaded
console.log('🔍 Cloudinary Configuration:');
console.log('  - Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? `${process.env.CLOUDINARY_CLOUD_NAME.substring(0, 8)}...` : '❌ Missing');
console.log('  - API Key:', process.env.CLOUDINARY_API_KEY ? `${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...` : '❌ Missing');
console.log('  - API Secret:', process.env.CLOUDINARY_API_SECRET ? `${process.env.CLOUDINARY_API_SECRET.substring(0, 8)}...` : '❌ Missing');

// Debug: Show exact values (first few characters for security)
console.log('🔍 Exact Credential Values:');
console.log('  - Cloud Name Value:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  - API Key Value:', process.env.CLOUDINARY_API_KEY);
console.log('  - API Secret Length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);

// Test Cloudinary connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Cloudinary Connection Failed:', error.message);
  } else {
    console.log('✅ Cloudinary Connection Successful:', result);
  }
});

// Fallback to local storage if Cloudinary is not configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET &&
                     process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
                     process.env.CLOUDINARY_API_KEY !== 'demo' &&
                     process.env.CLOUDINARY_API_SECRET !== 'demo';

let storage;

if (useCloudinary) {
  // Configure Cloudinary storage for multer
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'waste2resource/listings',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ],
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    },
    params: {
      folder: 'waste2resource/listings', // Ensure folder is set in params too
      resource_type: 'image'
    }
  });
  console.log('☁️ Using Cloudinary for image storage');
  console.log('📁 Target folder: waste2resource/listings');
} else {
  // Fallback to local storage
  const path = require('path');
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
  });
  console.log('📁 Using local storage for images (Cloudinary not configured)');
}

// Initialize multer with storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = { cloudinary, upload };
