import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";

const UserStatsCard = ({ userData, loading }) => {
  // If no user data or still loading, show loader
  if (loading || !userData) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 flex items-center justify-center h-40">
        <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  const { 
    correctPredictions = 0, 
    totalMatches = 0,
    correctPotmPredictions = 0,
    bothCorrectPredictions = 0,
    totalPoints = 0
  } = userData;

  // Calculate accuracy
  const accuracy = totalMatches > 0 ? Math.round((correctPredictions / totalMatches) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-sm font-semibold">Your Accuracy</h2>
      </div>
      
      <div className="p-3 flex flex-col sm:flex-row items-center">
        {/* Accuracy Chart - Smaller on mobile */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto sm:mx-0 mb-3 sm:mb-0">
          <CircularProgressbar
            value={accuracy}
            text={`${accuracy}%`}
            styles={buildStyles({
              pathColor: "#4ade80",
              textColor: "#166534",
              trailColor: "#fecaca",
              textSize: '22px',
              pathTransition: "stroke-dashoffset 0.5s ease 0s"
            })}
          />
          <div className="text-center mt-1 text-xs text-gray-500">
            {correctPredictions}/{totalMatches} matches
          </div>
        </div>
        
        {/* Stats Information - Moves below on mobile, side on desktop */}
        <div className="w-full sm:flex-1 sm:ml-4 mt-2 sm:mt-0">
          <div className="grid grid-cols-2 gap-2 text-center sm:text-left">
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="text-gray-500 text-xs">Total Points</div>
              <div className="text-blue-600 font-bold text-lg">{totalPoints}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="text-gray-500 text-xs">POTM Correct</div>
              <div className="text-blue-600 font-bold text-lg">{correctPotmPredictions}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg col-span-2">
              <div className="text-gray-500 text-xs">Both Team & POTM Correct</div>
              <div className="text-blue-600 font-bold text-lg">{bothCorrectPredictions}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserStatsCard;