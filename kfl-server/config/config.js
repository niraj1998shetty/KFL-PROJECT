require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  // Remove any potential prefix from the connection string
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/kfl',
  JWT_SECRET: process.env.JWT_SECRET || 'kfl_secret_key_should_be_changed',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d'
};