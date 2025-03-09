const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Initial users data
const users = [
  {
    name: "Niraj",
    mobile: "9538263599",
    password: "niraj123"
  },
  {
    name: "Sagar",
    mobile: "9876543211",
    password: "rohit123"
  },
  {
    name: "Nikhil",
    mobile: "9876543212",
    password: "bumrah123"
  }
];

// Connect to database
connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    
    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        name: user.name,
        mobile: user.mobile,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }
    
    console.log('Data Imported!');
    console.log('Users created:', createdUsers.map(u => ({ name: u.name, mobile: u.mobile })));
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the import
importData();