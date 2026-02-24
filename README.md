# Waste-to-Resource Marketplace – Circular Economy Platform

A production-ready MERN stack application that connects households and businesses (sellers) with recyclers and industries (buyers) to trade reusable waste materials.

## 🚀 Features

### Authentication
- User registration and login
- Role-based access control (Seller, Buyer, Admin)
- JWT token-based authentication
- Secure password hashing with bcrypt

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

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, React Router, Axios, Context API
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer, Cloudinary
- **Styling**: Tailwind CSS
- **Validation**: Express Validator

## 📁 Project Structure

```
waste2Resource/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd waste2Resource
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```

4. **Setup MongoDB**
   - Make sure MongoDB is running
   - Create a database named `waste2resource`

### Environment Variables

#### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste2resource
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Usage

### Default Admin Account
- Email: admin@waste2resource.com
- Password: admin123

### User Roles
1. **Seller**: Can list waste materials for sale
2. **Buyer**: Can browse and purchase waste materials
3. **Admin**: Can manage users and listings

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing (Seller)
- `GET /api/listings/:id` - Get listing details
- `PUT /api/listings/:id` - Update listing (Seller)
- `DELETE /api/listings/:id` - Delete listing (Seller/Admin)

### Transactions
- `POST /api/transactions` - Create transaction (Buyer)
- `GET /api/transactions` - Get user transactions
- `PUT /api/transactions/:id` - Update transaction status

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `DELETE /api/admin/listings/:id` - Delete listing

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please contact support@waste2resource.com
