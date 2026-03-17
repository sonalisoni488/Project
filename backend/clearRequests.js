const mongoose = require('mongoose');
const BuyerRequest = require('./models/BuyerRequest');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource')
.then(async () => {
  console.log('Connected to MongoDB');
  const result = await BuyerRequest.deleteMany({});
  console.log('Deleted', result.deletedCount, 'buyer requests');
  await mongoose.connection.close();
  console.log('Database cleared');
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
