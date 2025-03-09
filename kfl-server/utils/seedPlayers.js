//-----
const mongoose = require('mongoose');
const Player = require('../models/Player');
const config = require('../config/config');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Updated Team and player data
const teamPlayers = {
  "KKR": [
    "Ajinkya Rahane", "Manish Pandey", "Angkrish Raghuvanshi", "Rinku Singh", 
    "Luvnith Sisodia", "Quinton de Kock", "Rahmanullah Gurbaz", "Sunil Narine", 
    "Andre Russell", "Ramandeep Singh", "Anukul Roy", "Rovman Powell", 
    "Venkatesh Iyer", "Moeen Ali", "Varun Chakravarthy", "Harshit Rana", 
    "Vaibhav Arora", "Mayank Markande", "Umran Malik", "Anrich Nortje", 
    "Spencer Johnson"
  ],
  "RCB": [
    "Virat Kohli", "Rajat Patidar", "Swastik Chikara", "Devdutt Padikkal", 
    "Jitesh Sharma", "Philip Salt", "Manoj Bhandage", "Tim David", 
    "Krunal Pandya", "Liam Livingstone", "Romario Shepherd", "Jacob Bethell", 
    "Swapnil Singh", "Bhuvneshwar Kumar", "Josh Hazlewood", "Nuwan Thushara", 
    "Lungi Ngidi", "Yash Dayal", "Rasikh Dar Salam", "Suyash Sharma", 
    "Mohit Rathee", "Abhinandan Singh"
  ],
  "CSK": [
    "Ruturaj Gaikwad", "Shaik Rasheed", "Andre Siddarth C", "Rahul Tripathi", 
    "Devon Conway", "MS Dhoni", "Vansh Bedi", "Shivam Dube", 
    "Ravindra Jadeja", "Vijay Shankar", "Deepak Hooda", "Anshul Kamboj", 
    "Rachin Ravindra", "Jamie Overton", "Kamlesh Nagarkoti", "Ramakrishna Ghosh", 
    "Ravichandran Ashwin", "Sam Curran", "Matheesha Pathirana", "Shreyas Gopal", 
    "Mukesh Choudhary", "Nathan Ellis", "Gurjapneet Singh", "Noor Ahmad", 
    "Khaleel Ahmed"
  ],
  "MI": [
    "Suryakumar Yadav", "Rohit Sharma", "Tilak Varma", "Bevon Jacobs", 
    "Ryan Rickelton", "Robin Minz", "Krishnan Shrijith", "Hardik Pandya", 
    "Naman Dhir", "Raj Bawa", "Vignesh Puthur", "Will Jacks", 
    "Mitchell Santner", "Jasprit Bumrah", "Arjun Tendulkar", "Ashwani Kumar", 
    "Reece Topley", "Lizaad Williams", "Karn Sharma", "Trent Boult", 
    "Deepak Chahar", "Satyanarayana Raju", "Mujeeb Ur Rahman"
  ],
  "PBKS": [
    "Nehal Wadhera", "Harnoor Singh", "Shreyas Iyer", "Musheer Khan", 
    "Pyla Avinash", "Prabhsimran Singh", "Vishnu Vinod", "Josh Inglis", 
    "Marcus Stoinis", "Glenn Maxwell", "Praveen Dubey", "Priyansh Arya", 
    "Azmatullah Omarzai", "Aaron Hardie", "Marco Jansen", "Harpreet Brar", 
    "Suryansh Shedge", "Shashank Singh", "Lockie Ferguson", "Yuzvendra Chahal", 
    "Arshdeep Singh", "Xavier Bartlett", "Kuldeep Sen", "Vijaykumar Vyshak", 
    "Yash Thakur"
  ],
  "LSG": [
    "Nicholas Pooran", "Ravi Bishnoi", "Mayank Yadav", "Ayush Badoni", 
    "Rishabh Pant", "David Miller", "Aiden Markram", "Mitchell Marsh", 
    "Avesh Khan", "Abdul Samad", "Aryan Juyal", "Akash Deep", 
    "Himmat Singh", "Manimaran Siddharth", "Digvesh Singh", "Shahbaz Ahmed", 
    "Akash Singh", "Shamar Joseph", "Prince Yadav", "Yuvraj Chaudhary", 
    "RS Hangargekar", "Arshin Kulkarni", "Matthew Breetzke", "Mohsin Khan"
  ],
  "DC": [
    "Karun Nair", "Harry Brook", "Jake Fraser-McGurk", "Faf du Plessis", 
    "Tristan Stubbs", "Abishek Porel", "Donovan Ferreira", "KL Rahul", 
    "Axar Patel", "Sameer Rizvi", "Ashutosh Sharma", "Darshan Nalkande", 
    "Ajay Jadav Mandal", "Vipraj Nigam", "Manvanth Kumar L", "Tripurana Vijay", 
    "Madhav Tiwari", "Kuldeep Yadav", "Dushmantha Chameera", "Mitchell Starc", 
    "Mohit Sharma", "T Natarajan", "Mukesh Kumar"
  ],
  "SRH": [
    "Heinrich Klaasen", "Pat Cummins", "Travis Head", "Abhishek Sharma", 
    "Nitish Kumar Reddy", "Ishan Kishan", "Mohammed Shami", "Harshal Patel", 
    "Abhinav Manohar", "Rahul Chahar", "Adam Zampa", "Simarjeet Singh", 
    "Eshan Malinga", "Jaydev Unadkat", "Brydon Carse", "Kamindu Mendis", 
    "Zeeshan Ansari", "Atharva Taide", "Sachin Baby", "Aniket Verma"
  ],
  "GT": [
    "Shubman Gill", "Sai Sudharsan", "Glenn Phillips", "Kumar Kushagra", 
    "Anuj Rawat", "Jos Buttler", "Rashid Khan", "Rahul Tewatia", 
    "Shahrukh Khan", "Nishant Sindhu", "Ravisrinivasan Sai Kishore", 
    "Gerald Coetzee", "Jayant Yadav", "Arshad Khan", "Karim Janat", 
    "Sherfane Rutherford", "Mahipal Lomror", "Washington Sundar", 
    "Manav Suthar", "Gurnoor Brar", "Ishant Sharma", "Kagiso Rabada", 
    "Prasidh Krishna", "Kulwant Khejroliya", "Mohammed Siraj"
  ],
  "RR": [
    "Yashasvi Jaiswal", "Shimron Hetmyer", "Shubham Dubey", "Vaibhav Suryavanshi", 
    "Sanju Samson", "Dhruv Jurel", "Kunal Singh Rathore", "Riyan Parag", 
    "Yudhvir Singh Charak", "Nitish Rana", "Sandeep Sharma", "Tushar Deshpande", 
    "Akash Madhwal", "Kumar Kartikeya", "Kwena Maphaka", "Wanindu Hasaranga", 
    "Maheesh Theekshana", "Fazalhaq Farooqi", "Ashok Sharma", "Jofra Archer"
  ]
};

// Create players
const createPlayers = async () => {
  try {
    // Clear existing players
    await Player.deleteMany({});
    
    const players = [];
    
    // Create players for each team
    for (const [team, playerNames] of Object.entries(teamPlayers)) {
      playerNames.forEach(name => {
        players.push({
          name,
          team
        });
      });
    }
    
    const savedPlayers = await Player.insertMany(players);
    console.log(`${savedPlayers.length} players created successfully`);
    
    return savedPlayers;
  } catch (error) {
    console.error('Error creating players:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the function
createPlayers();