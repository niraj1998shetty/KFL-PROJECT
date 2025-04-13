import React, { useState } from "react";
import { motion } from "framer-motion";

const RecentPerformanceCard = ({ recentMatches, loading }) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(null);

  // If still loading or no data, show loader
  if (loading || !recentMatches?.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  // Handle dot click to show/hide tooltip
  const handleDotClick = (index) => {
    if (activeMatchIndex === index) {
      setActiveMatchIndex(null); // Close tooltip if already open
    } else {
      setActiveMatchIndex(index); // Open tooltip for this match
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-base sm:text-lg font-semibold">Your Recent Performance</h2>
        <p className="text-xs text-white mt-1">Last 7 matches</p>
      </div>
      
      <div className="p-4">
        {recentMatches.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No recent completed matches available</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {recentMatches.map((match, index) => (
              <div key={index} className="relative">
                {/* Modified to have a tighter layout with fixed width container */}
                <div className="flex items-center">
                  <span className="text-sm font-medium w-32 mr-2">
                   {match.matchShort}
                  </span>
                  <div 
                    className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 ml-auto
                    ${!match.hasPrediction ? "bg-gray-400" : 
                      match.teamCorrect ? "bg-green-500" : "bg-red-500"}`}
                    onClick={() => handleDotClick(index)}
                  >
                    <span className="text-white text-xs">
                      {!match.hasPrediction ? "?" : match.teamCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
                
                {/* Tooltip that appears when dot is clicked */}
                {activeMatchIndex === index && (
                  <div className="absolute right-8 top-0 z-10 bg-white p-3 border border-gray-200 shadow-md rounded-md w-64">
                    <p className="font-semibold">{match.match}</p>
                    {match.hasPrediction ? (
                      <>
                        <p className="text-sm">
                          Team prediction: <span className={`font-medium ${match.teamCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {match.teamCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </p>
                        <p className="text-sm">
                          POTM prediction: <span className={`font-medium ${match.potmCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {match.potmCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-orange-600 font-medium">No prediction made</p>
                    )}
                    <p className="text-sm mt-1">Date: {match.date}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-6 text-xs gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-1 rounded-full"></div>
            <span>Correct</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 mr-1 rounded-full"></div>
            <span>Incorrect</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 mr-1 rounded-full"></div>
            <span>No Prediction</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentPerformanceCard;