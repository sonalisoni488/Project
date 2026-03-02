# 🚀 Waste2Resource Backend Setup with MongoDB Compass

## 📋 Prerequisites Checklist

- [ ] **MongoDB Community Server** installed
- [ ] **MongoDB Compass** installed  
- [ ] **Node.js** and **npm** installed
- [ ] **Git** installed

## 🛠 Installation Steps

### 1. Install MongoDB Community Server

#### Windows:
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB Compass (included in installer)
5. Click "Install MongoDB as a Windows Service"

#### Alternative - Using Chocolatey:
```bash
choco install mongodb
```

### 2. Verify Installation
```bash
mongod --version
mongo --version
```

### 3. Start MongoDB Service
```bash
# Method 1: As Windows Service
net start MongoDB

# Method 2: Manual
mongod

# Method 3: From Services
# Open Windows Services → Find MongoDB → Start
```

## 🔧 Project Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Run setup script (creates .env file)
node setup-mongodb.js
```

### 3. Initialize Database
```bash
# Create collections and sample data
node scripts/init-database.js
```

### 4. Start Backend Server
```bash
npm start
# or for development
npm run dev
```

## 🧭 MongoDB Compass Connection

### Connection Details:
- **Connection String**: `mongodb://localhost:27017/waste2resource`
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `waste2resource`
- **Authentication**: None (local development)

### Step-by-Step:
1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Paste**: `mongodb://localhost:27017/waste2resource`
4. **Click "Connect"**

## 📊 Database Structure

After initialization, you'll see:

### Collections:
- **users** - User accounts (admin, seller, buyer)
- **listings** - Waste material listings  
- **transactions** - Transaction records

### Sample Data:
- 3 users with different roles
- 3 sample waste listings
- 1 sample transaction

### Indexes:
- Optimized for performance
- Email uniqueness
- Location-based queries
- Text search capabilities

## 🚀 Quick Start Commands

### All-in-One Setup:
```bash
# 1. Install MongoDB (if not installed)
# Download from: https://www.mongodb.com/try/download/community

# 2. Start MongoDB
mongod

# 3. Setup project
cd backend
npm install
node setup-mongodb.js
node scripts/init-database.js

# 4. Start backend
npm start
```

### Test Connection:
```bash
# Health check
curl http://localhost:5002/api/health

# Expected response:
{
  "status": "OK",
  "message": "Waste2Resource API is running",
  "timestamp": "2024-02-25T..."
}
```

## 🐛 Troubleshooting

### Issue: "mongod not recognized"
**Solution**: 
- Add MongoDB to PATH
- Or use full path: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`

### Issue: "Cannot connect to MongoDB"
**Solutions**:
1. Start MongoDB: `mongod`
2. Check port 27017: `netstat -an | findstr 27017`
3. Verify connection string: `mongodb://localhost:27017/waste2resource`

### Issue: "Database not found"
**Solution**:
- Run initialization: `node scripts/init-database.js`
- Check database name in connection string

### Issue: "Permission denied"
**Solutions**:
- Run as Administrator
- Check data directory permissions
- Ensure MongoDB service has proper permissions

## 📱 Testing Everything

### 1. Backend API Test:
```bash
# Health endpoint
curl http://localhost:5002/api/health

# Should return:
{
  "status": "OK",
  "message": "Waste2Resource API is running"
}
```

### 2. Frontend Connection:
- Open frontend: http://localhost:3002
- Try to login/signup
- Check browser console for API calls

### 3. Database Verification:
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017/waste2resource`
- Verify collections exist
- Check sample data

## 🎯 Success Indicators

✅ **MongoDB Service Running** (port 27017 active)
✅ **Backend Server Running** (port 5002 active)  
✅ **Database Connected** (no connection errors)
✅ **Collections Created** (users, listings, transactions)
✅ **Sample Data Loaded** (test data visible in Compass)
✅ **API Responding** (health check successful)
✅ **Frontend Connected** (can make API calls)

## 📚 Additional Resources

- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- [MongoDB Compass Tutorial](https://docs.mongodb.com/compass/master/)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

## 🎉 You're Ready!

Once all steps are complete:
1. **MongoDB** is running on port 27017
2. **Backend** is running on port 5002  
3. **Frontend** is running on port 3002
4. **Database** is accessible via MongoDB Compass

**Full Stack URL**: 
- Frontend: http://localhost:3002
- Backend API: http://localhost:5002/api
- Database: mongodb://localhost:27017/waste2resource

Happy coding! 🚀♻️
