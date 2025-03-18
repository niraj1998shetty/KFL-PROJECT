const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger'); // Added logger
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

app.use((req, res, next) => {

  logger.info(`Incoming request: ${req.method} ${req.url}`);

  next();

});
const allowedOrigins = [
  'https://katthegangfantasyleague.com',
  'http://localhost:5000/api',
  'http://localhost:5173'
];
// Middleware
//app.use(cors({ origin: 'https://katthegangfantasyleague.com', credentials: true }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


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

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
