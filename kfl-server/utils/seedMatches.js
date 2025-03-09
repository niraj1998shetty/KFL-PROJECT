// ___________________________________________________

const mongoose = require('mongoose');
const Match = require('../models/Matches');
const config = require('../config/config');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// IPL 2025 Schedule Data
const matchesData = [
  { date: '22/03/2025', match: 'KKR vs RCB', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '23/03/2025', match: 'SRH vs RR', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '14:30 IST' },
  { date: '23/03/2025', match: 'MI vs CSK', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '24/03/2025', match: 'DC vs LSG', venue: 'Dr. Y.S. Rajasekhara Reddy Stadium, Vizag', time: '18:30 IST' },
  { date: '25/03/2025', match: 'GT vs PBKS', venue: 'Narendra Modi Stadium, Ahmedabad', time: '18:30 IST' },
  { date: '26/03/2025', match: 'RR vs KKR', venue: 'Guwahati', time: '18:30 IST' },
  { date: '27/03/2025', match: 'SRH vs LSG', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '28/03/2025', match: 'RCB vs CSK', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '29/03/2025', match: 'GT vs MI', venue: 'Narendra Modi Stadium, Ahmedabad', time: '18:30 IST' },
  { date: '30/03/2025', match: 'DC vs SRH', venue: 'Dr. Y.S. Rajasekhara Reddy Stadium, Vizag', time: '14:30 IST' },
  { date: '30/03/2025', match: 'RR vs CSK', venue: 'Guwahati', time: '18:30 IST' },
  { date: '31/03/2025', match: 'MI vs KKR', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '01/04/2025', match: 'LSG vs PBKS', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '02/04/2025', match: 'RCB vs GT', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '03/04/2025', match: 'KKR vs SRH', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '04/04/2025', match: 'LSG vs MI', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '05/04/2025', match: 'CSK vs DC', venue: 'MA Chidambaram Stadium, Chennai', time: '14:30 IST' },
  { date: '05/04/2025', match: 'PBKS vs RR', venue: 'New Chandigarh', time: '18:30 IST' },
  { date: '06/04/2025', match: 'KKR vs LSG', venue: 'Eden Gardens, Kolkata', time: '14:30 IST' },
  { date: '06/04/2025', match: 'SRH vs GT', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '07/04/2025', match: 'MI vs RCB', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '08/04/2025', match: 'PBKS vs CSK', venue: 'New Chandigarh', time: '18:30 IST' },
  { date: '09/04/2025', match: 'GT vs RR', venue: 'Narendra Modi Stadium, Ahmedabad', time: '18:30 IST' },
  { date: '10/04/2025', match: 'RCB vs DC', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '11/04/2025', match: 'CSK vs KKR', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '12/04/2025', match: 'LSG vs GT', venue: 'Ekana Cricket Stadium, Lucknow', time: '14:30 IST' },
  { date: '12/04/2025', match: 'SRH vs PBKS', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '13/04/2025', match: 'RR vs RCB', venue: 'Sawai Mansingh Stadium, Jaipur', time: '14:30 IST' },
  { date: '13/04/2025', match: 'DC vs MI', venue: 'Arun Jaitley Stadium, Delhi', time: '18:30 IST' },
  { date: '14/04/2025', match: 'LSG vs CSK', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '15/04/2025', match: 'PBKS vs KKR', venue: 'New Chandigarh', time: '18:30 IST' },
  { date: '16/04/2025', match: 'DC vs RR', venue: 'Arun Jaitley Stadium, Delhi', time: '18:30 IST' },
  { date: '17/04/2025', match: 'MI vs SRH', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '18/04/2025', match: 'RR vs PBKS', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '19/04/2025', match: 'GT vs DC', venue: 'Narendra Modi Stadium, Ahmedabad', time: '14:30 IST' },
  { date: '19/04/2025', match: 'RR vs LSG', venue: 'Sawai Mansingh Stadium, Jaipur', time: '18:30 IST' },
  { date: '20/04/2025', match: 'PBKS vs RCB', venue: 'New Chandigarh', time: '14:30 IST' },
  { date: '20/04/2025', match: 'MI vs CSK', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '21/04/2025', match: 'KKR vs GT', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '22/04/2025', match: 'LSG vs DC', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '23/04/2025', match: 'SRH vs MI', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '24/04/2025', match: 'RCB vs RR', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '25/04/2025', match: 'CSK vs SRH', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '26/04/2025', match: 'KKR vs PBKS', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '27/04/2025', match: 'MI vs LSG', venue: 'Wankhede Stadium, Mumbai', time: '14:30 IST' },
  { date: '27/04/2025', match: 'DC vs RCB', venue: 'Arun Jaitley Stadium, Delhi', time: '18:30 IST' },
  { date: '28/04/2025', match: 'RR vs GT', venue: 'Sawai Mansingh Stadium, Jaipur', time: '18:30 IST' },
  { date: '29/04/2025', match: 'DC vs KKR', venue: 'Arun Jaitley Stadium, Delhi', time: '18:30 IST' },
  { date: '30/04/2025', match: 'CSK vs PBKS', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '01/05/2025', match: 'RR vs MI', venue: 'Sawai Mansingh Stadium, Jaipur', time: '18:30 IST' },
  { date: '02/05/2025', match: 'GT vs SRH', venue: 'Narendra Modi Stadium, Ahmedabad', time: '18:30 IST' },
  { date: '03/05/2025', match: 'RR vs CSK', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '04/05/2025', match: 'KKR vs RR', venue: 'Eden Gardens, Kolkata', time: '14:30 IST' },
  { date: '04/05/2025', match: 'PBKS vs CSK', venue: 'Himachal Pradesh Cricket Association Stadium, Dharamsala', time: '18:30 IST' },
  { date: '05/05/2025', match: 'SRH vs DC', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '06/05/2025', match: 'MI vs GT', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '07/05/2025', match: 'KKR vs CSK', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '08/05/2025', match: 'PBKS vs DC', venue: 'Himachal Pradesh Cricket Association Stadium, Dharamsala', time: '18:30 IST' },
  { date: '09/05/2025', match: 'LSG vs RCB', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '10/05/2025', match: 'SRH vs KKR', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '11/05/2025', match: 'PBKS vs MI', venue: 'Himachal Pradesh Cricket Association Stadium, Dharamsala', time: '14:30 IST' },
  { date: '11/05/2025', match: 'DC vs GT', venue: 'Arun Jaitley Stadium, Delhi', time: '18:30 IST' },
  { date: '12/05/2025', match: 'CSK vs RR', venue: 'MA Chidambaram Stadium, Chennai', time: '18:30 IST' },
  { date: '13/05/2025', match: 'RCB vs SRH', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '14/05/2025', match: 'GT vs LSG', venue: 'Narendra Modi Stadium, Ahmedabad', time: '18:30 IST' },
  { date: '15/05/2025', match: 'MI vs DC', venue: 'Wankhede Stadium, Mumbai', time: '18:30 IST' },
  { date: '16/05/2025', match: 'RR vs PBKS', venue: 'Sawai Mansingh Stadium, Jaipur', time: '18:30 IST' },
  { date: '17/05/2025', match: 'RCB vs KKR', venue: 'M.Chinnaswamy Stadium, Bengaluru', time: '18:30 IST' },
  { date: '18/05/2025', match: 'GT vs CSK', venue: 'Narendra Modi Stadium, Ahmedabad', time: '14:30 IST' },
  { date: '18/05/2025', match: 'LSG vs SRH', venue: 'Ekana Cricket Stadium, Lucknow', time: '18:30 IST' },
  { date: '20/05/2025', match: 'Quali1 vs quali2', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '21/05/2025', match: 'Eliminator1 vs Eliminator2', venue: 'Rajiv Gandhi International Stadium, Hyderabad', time: '18:30 IST' },
  { date: '23/05/2025', match: 'Qualifier1 vs qualifier2', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' },
  { date: '25/05/2025', match: 'Final1 vs final2', venue: 'Eden Gardens, Kolkata', time: '18:30 IST' }
];

// Create matches
const createMatches = async () => {
  try {
    // Clear existing matches
    await Match.deleteMany({});

    const matches = matchesData.map((match, index) => ({
      matchNumber: index + 1,
      date: match.date,
      team1: match.match.split(' vs ')[0],
      team2: match.match.split(' vs ')[1],
      venue: match.venue,
      time: match.time,
      result: {
        winner: null,
        playerOfTheMatch: null,
        completed: false
      }
    }));

    const savedMatches = await Match.insertMany(matches);
    console.log(`${savedMatches.length} matches created successfully`);

    return savedMatches;
  } catch (error) {
    console.error('Error creating matches:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the function
createMatches();