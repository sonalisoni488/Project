# 🚀 Quick Start Guide - Waste-to-Resource Marketplace

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for version control)

### Optional Software
- **MongoDB Compass** (for database management)
- **Postman** (for API testing)
- **VS Code** (recommended IDE)

## 🛠 Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd waste2Resource
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
# Open .env and update with your configuration:
# - MONGODB_URI: your_mongodb_connection_string
# - JWT_SECRET: your_jwt_secret_key
# - CLOUDINARY_CLOUD_NAME: your_cloudinary_cloud_name
# - CLOUDINARY_API_KEY: your_cloudinary_api_key
# - CLOUDINARY_API_SECRET: your_cloudinary_api_secret
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
# Add: REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend/.env

## 🚀 Start the Application

### Development Mode
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend (in a new terminal)
cd ../frontend
npm start
```

### Production Mode
```bash
# Terminal 1: Build Frontend
cd ../frontend
npm run build

# Terminal 2: Start Backend
cd ../backend
NODE_ENV=production npm start
```

## 🔑 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002/api

## 🎯 Default Login Credentials

### Admin Account
- **Email**: admin@waste2resource.com
- **Password**: admin123
- **Role**: Admin

### Seller Account
- **Email**: john.seller@example.com
- **Password**: password123
- **Role**: Seller

### Buyer Account
- **Email**: jane.buyer@example.com
- **Password**: password123
- **Role**: Buyer

## 📊 Seed the Database

After setting up your environment variables:

```bash
# Navigate to backend directory
cd backend

# Run the seed script
npm run seed
```

This will create:
- 5 sample users (admin, sellers, buyers)
- Sample listings for each waste type
- Sample transactions

## 🏗 Project Structure

```
waste2Resource/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/       # Authentication & validation
│   ├── scripts/            # Database seeding
│   ├── uploads/            # File uploads
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Dependencies
│   └── server.js           # Express server setup
├── frontend/
│   ├── src/
│   │   ├── context/       # React Context API
│   ├── pages/         # Page components
│   ├── services/      # API service functions
│   ├── SimpleApp.js   # Main React app
│   └── simple.css      # Styles
│   └── package-simple.json # Dependencies
├── README.md               # Project documentation
├── SETUP.md               # Setup guide
└── QUICK_START.md           # This guide
```

## 🔧 Environment Variables

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/waste2resource
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Optional: Cloudinary (for image upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Common Issues & Solutions

### Port Already in Use
**Error**: `Error: listen EADDRINUSE: :::5000`
**Solution**: 
1. Find process using port 5000: `netstat -ano | findstr :5000`
2. Kill the process: `taskkill /F /IM node.exe /PID` (Windows) or `kill -9 PID` (Mac/Linux)
3. Change port in backend/.env to another number

### MongoDB Connection Error
**Error**: `MongoNetworkError: failed to connect to server`
**Solution**:
1. Check MongoDB is running
2. Verify MONGODB_URI in .env file
3. Check network connectivity
4. Check MongoDB Atlas IP whitelist

### Dependencies Installation Error
**Error**: `npm ERR! peer dep missing`
**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Use exact versions from package.json

### CORS Error
**Error**: `Access to XMLHttpRequest at 'http://localhost:3000' from origin 'http://localhost:5000' has been blocked by CORS policy`
**Solution**:
1. Backend CORS is configured for development
2. Frontend is trying to access production API
3. Check REACT_APP_API_URL in frontend/.env

### Frontend Build Error
**Error**: `Module not found: Can't resolve 'react-scripts'`
**Solution**:
1. Install dependencies: `npm install`
2. Check if you're in the correct directory
3. Try: `npx create-react-app my-app` (if starting fresh)

## 🎯 Development Workflow

### 1. Start Development Servers
```bash
# Terminal 1: Backend (auto-restarts on file changes)
cd backend
npm run dev

# Terminal 2: Frontend (auto-restarts on file changes)
cd ../frontend
npm start
```

### 2. Git Workflow
```bash
# Add all changes
git add .
git commit -m "Initial commit"

# Create feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
```

## 🚀 Production Deployment

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Environment Setup
1. Set production environment variables
2. Configure reverse proxy
3. Set up SSL certificates
4. Use MongoDB Atlas for production database

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Deploy backend (if needed)
vercel --prod
```

#### Option 2: Docker
```bash
# Build Docker images
docker build -t backend .
docker build -t frontend .

# Run with Docker Compose
docker-compose up -d
```

#### Option 3: Traditional Server
```bash
# Build production versions
npm run build

# Deploy to server
# Configure Nginx/Apache
# Upload files to server
```

## 🔍 API Testing

### Using Postman
1. Import the collection: `POSTMAN_COLLECTION.json`
2. Set environment variables in Postman
3. Test all endpoints manually

### Using curl
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"buyer","location":"New York, NY"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔧 Useful Scripts

### Database Management
```bash
# Reset database
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connection.dropDatabase().then(() => {
  console.log('Database reset successfully');
  process.exit(0);
}).catch((err) => {
  console.error('Error resetting database:', err);
});
```

### Backup Database
```bash
# Create backup
mongod --db waste2resource --out backup.json
```

## 📊 Monitoring

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check frontend health
curl http://localhost:3000
```

---

## 🎉 Support

### Getting Help
1. **Documentation**: Refer to README.md and API documentation
2. **Issues**: Check console logs and error messages
3. **Community**: Join our Discord/Slack community
4. **Email**: support@waste2resource.com

---

**Happy Coding! 🚀**

This platform is now ready for development and deployment. Follow the quick start guide above to get your environment set up and running quickly.
