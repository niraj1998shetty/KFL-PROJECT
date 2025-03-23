const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

// Connect to your database
mongoose.connect(config.MONGO_URI);

async function updateUsers() {
  try {
    const result = await User.updateMany(
      { points: { $exists: false } },
      { $set: { points: 0 } }
    );
    
    console.log(`Updated ${result.modifiedCount} users with points field`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateUsers();