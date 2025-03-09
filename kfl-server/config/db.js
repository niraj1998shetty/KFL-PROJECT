const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Hardcode the connection string directly
    const uri = 'mongodb+srv://niraj:niraj%40123@cluster0.o8zem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;