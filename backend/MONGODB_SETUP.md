# MongoDB Compass Setup Guide

## 🚀 Quick Setup

### 1. Install MongoDB
```bash
# Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
# Or install with chocolatey (Windows):
choco install mongodb
```

### 2. Start MongoDB Service
```bash
# Windows
mongod

# Or as service
net start MongoDB
```

### 3. Setup Environment
```bash
# Run the setup script
node setup-mongodb.js

# Initialize database with sample data
node scripts/init-database.js
```

## 🧭 MongoDB Compass Connection

### Connection String
```
mongodb://localhost:27017/waste2resource
```

### Step-by-Step Connection
1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Paste connection string**: `mongodb://localhost:27017/waste2resource`
4. **Click "Connect"**

### Connection Details
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `waste2resource`
- **Authentication**: None (for local development)

## 📊 Database Structure

### Collections
1. **users** - User accounts and profiles
2. **listings** - Waste material listings
3. **transactions** - Transaction records

### Sample Data
The initialization script creates:
- 3 sample users (admin, seller, buyer)
- 3 sample listings (plastic, organic, e-waste)
- 1 sample transaction

### Indexes Created
- **users**: email, role, location, rating
- **listings**: seller, category, wasteType, location, price, text search
- **transactions**: buyer, seller, listing, status

## 🔧 Backend Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/waste2resource
JWT_SECRET=waste2resource_jwt_secret_key_2024
PORT=5002
NODE_ENV=development
```

### Start Backend
```bash
cd backend
npm install
npm start
```

## 🎯 Testing the Connection

### 1. Health Check
```bash
curl http://localhost:5002/api/health
```

### 2. Test Database Connection
```bash
node scripts/init-database.js
```

### 3. Verify in Compass
- Open Compass
- Navigate to `waste2resource` database
- Check collections: `users`, `listings`, `transactions`

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Not Running
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

#### 2. Connection Refused
```bash
# Check if port 27017 is available
netstat -an | findstr 27017

# Kill existing MongoDB process
taskkill /f /im mongod.exe
```

#### 3. Permission Issues
```bash
# Run MongoDB as administrator
# Or check data directory permissions
```

#### 4. Compass Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure firewall allows port 27017
- Try connecting without authentication first

### Error Messages & Solutions

#### "Cannot connect to MongoDB"
- ✅ Start MongoDB service: `mongod`
- ✅ Check port: `27017`
- ✅ Verify connection string

#### "Authentication failed"
- ✅ Remove auth from connection string for local dev
- ✅ Use: `mongodb://localhost:27017/waste2resource`

#### "Database not found"
- ✅ Run initialization: `node scripts/init-database.js`
- ✅ Check database name in connection string

## 📱 Compass Features to Use

### 1. **Data Visualization**
- View collection data
- Filter and sort documents
- Export data to JSON/CSV

### 2. **Query Builder**
- Build complex queries visually
- Test aggregation pipelines
- Performance analysis

### 3. **Index Management**
- View existing indexes
- Create new indexes
- Monitor index usage

### 4. **Schema Analysis**
- Analyze data structure
- Identify data types
- Find outliers

## 🚀 Production Setup

### For Production, Use:
```env
MONGODB_URI=mongodb://username:password@host:port/database
```

### Security Considerations:
- Enable authentication
- Use SSL/TLS
- Set up user roles
- Configure firewall rules

## 📚 Additional Resources

- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**✅ Ready to Go!** Your MongoDB database is now configured for use with MongoDB Compass and the Waste2Resource backend.
