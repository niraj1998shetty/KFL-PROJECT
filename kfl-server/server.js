const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const playerRoutes = require('./routes/playerRoutes');
const whitelistRoutes = require('./routes/whitelistRoutes');
const semifinalRoutes = require('./routes/semifinalRoutes'); // Added semifinal routes
const { errorHandler } = require('./utils/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/whitelist', whitelistRoutes);
app.use('/api/semifinals', semifinalRoutes); // Added semifinal routes

// Basic route
app.get('/', (req, res) => {
  res.send('KattheGang Fantasy League API is running');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});