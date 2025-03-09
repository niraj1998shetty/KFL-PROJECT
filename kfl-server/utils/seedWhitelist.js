const mongoose = require('mongoose');
const WhitelistedNumber = require('../models/WhitelistedNumber');
const User = require('../models/User');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample valid Indian mobile numbers starting with 6-9
const generateRandomMobileNumber = () => {
  const firstDigit = Math.floor(Math.random() * 4) + 6;// 8, or 9
  let remainingDigits = '';
  for (let i = 0; i < 9; i++) {
    remainingDigits += Math.floor(Math.random() * 10);
  }
  console.log(`${firstDigit}${remainingDigits}`);
  return `${firstDigit}${remainingDigits}`;
};

const seedWhitelist = async () => {
  try {
    // Clear existing whitelist
    await WhitelistedNumber.deleteMany({});
    
    // Get existing users to include their numbers
    const existingUsers = await User.find({}).select('mobile');
    const existingNumbers = existingUsers.map(user => user.mobile);
    
    // Create documents for existing numbers
    const existingNumberDocs = existingNumbers.map(mobile => ({
      mobile,
      isRegistered: true
    }));
    
    // Generate additional random numbers to reach a total of 25
    const additionalNumbersCount = 25 - existingNumbers.length;
    const additionalNumbers = [];
    
    // Ensure we generate unique numbers
    for (let i = 0; i < additionalNumbersCount; i++) {
      let newNumber;
      do {
        newNumber = generateRandomMobileNumber();
      } while (
        existingNumbers.includes(newNumber) || 
        additionalNumbers.includes(newNumber)
      );
      
      additionalNumbers.push(newNumber);
    }
    
    // Create documents for additional numbers
    const additionalNumberDocs = additionalNumbers.map(mobile => ({
      mobile,
      isRegistered: false
    }));
    
    // Combine and insert all documents
    const allNumberDocs = [...existingNumberDocs, ...additionalNumberDocs];
    await WhitelistedNumber.insertMany(allNumberDocs);
    
    console.log(`Seeded whitelist with ${allNumberDocs.length} numbers`);
    console.log('Existing numbers:', existingNumbers);
    console.log('Additional numbers:', additionalNumbers);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding whitelist:', error);
    process.exit(1);
  }
};

seedWhitelist();