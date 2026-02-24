# Setup Guide - Waste-to-Resource Marketplace

## 🚀 Quick Start

This guide will help you set up the Waste-to-Resource Marketplace platform on your local machine.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git**

## 🛠 Installation Steps

### 1. Clone the Repository

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

# Edit the .env file with your configuration
# Make sure to update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a secure secret key)
# - Cloudinary credentials (optional, for image upload)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit the .env file if needed
# Default: REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running on your system:

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend (in a new terminal)
cd frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 👤 Default Login Credentials

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

To populate the database with sample data:

```bash
cd backend
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
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Authentication & validation
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── scripts/            # Database seeding
│   ├── uploads/            # File uploads
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context API
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── SimpleApp.js   # Main React app
│   ├── .env.example        # Environment variables template
│   └── package.json        # Frontend dependencies
├── README.md               # Project documentation
└── SETUP.md               # This setup guide
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/waste2resource

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (Optional - for image upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Environment Variables (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📱 Features

### Authentication
- User registration and login
- Role-based access control (Seller, Buyer, Admin)
- JWT token authentication
- Password hashing with bcrypt

### Seller Features
- Create waste listings with image upload
- Edit and delete own listings
- Track transaction status
- View listing analytics

### Buyer Features
- Browse available listings
- Advanced filtering (waste type, price, location)
- Send purchase requests
- Track transaction history

### Admin Features
- User management
- Listing moderation
- Platform statistics and analytics
- Delete inappropriate content

### Transaction Flow
- Buyer sends purchase request
- Seller accepts/rejects request
- Status tracking: pending → accepted → completed

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing (Seller)
- `PUT /api/listings/:id` - Update listing (Seller)
- `DELETE /api/listings/:id` - Delete listing (Seller/Admin)
- `GET /api/listings/my` - Get user's listings (Seller)

### Transactions
- `POST /api/transactions` - Create transaction (Buyer)
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id/status` - Update status (Seller)
- `DELETE /api/transactions/:id` - Cancel transaction (Buyer)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/listings` - Get all listings
- `DELETE /api/admin/listings/:id` - Delete listing
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/stats` - Get platform statistics

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check your MONGODB_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change the PORT in backend/.env
   - Kill processes using the port: `lsof -ti:5000 | xargs kill -9`

3. **CORS Errors**
   - Ensure REACT_APP_API_URL is correct
   - Check that backend is running on the specified port

4. **Image Upload Issues**
   - Configure Cloudinary credentials
   - Check file size limits in multer configuration

### Debug Mode

For development, you can enable debug logging by setting:
```bash
NODE_ENV=development
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

### Environment Variables for Production

Make sure to set these in your production environment:
- `NODE_ENV=production`
- Secure `JWT_SECRET`
- Production `MONGODB_URI`
- Cloudinary credentials (if using image upload)

## 📞 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check that all dependencies are installed

## 🔄 Development Workflow

1. Make changes to your code
2. Test the changes locally
3. Commit changes to version control
4. Deploy to staging/production

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)

---

**Happy Coding! 🎉**
