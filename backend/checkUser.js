const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/waste2resource')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user by ID
      const user = await User.findById('69b3d4500880eba534d7c944');
      console.log('User data:', user);
      console.log('User email:', user?.email);
      console.log('User phone:', user?.phone);
      console.log('User name:', user?.name);
      console.log('User location:', user?.location);
      
      // Also check if there are any users at all
      const allUsers = await User.find({});
      console.log('Total users found:', allUsers.length);
      
      if (allUsers.length > 0) {
        console.log('First user:', allUsers[0]);
      }
      
    } catch (error) {
      console.error('Error finding user:', error);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
