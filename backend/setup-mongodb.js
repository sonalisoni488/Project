#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create .env file for MongoDB connection
const envContent = `# Database - MongoDB Compass Connection
MONGODB_URI=mongodb://localhost:27017/waste2resource

# JWT
JWT_SECRET=waste2resource_jwt_secret_key_2024
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
PORT=5002
NODE_ENV=development

# AI Service
AI_SERVICE_URL=http://localhost:8000
`;

const envPath = path.join(__dirname, '.env');

// Write .env file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ .env file created successfully!');
console.log('📁 Location:', envPath);
console.log('');
console.log('🔗 MongoDB Connection String:');
console.log('mongodb://localhost:27017/waste2resource');
console.log('');
console.log('🧭 MongoDB Compass Setup:');
console.log('1. Open MongoDB Compass');
console.log('2. Click "New Connection"');
console.log('3. Paste: mongodb://localhost:27017/waste2resource');
console.log('4. Click "Connect"');
console.log('');
console.log('🚀 To start the backend:');
console.log('cd backend && npm start');
console.log('');
console.log('📊 To start MongoDB (if not running):');
console.log('mongod');
