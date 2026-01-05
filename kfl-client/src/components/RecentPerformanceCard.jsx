import React, { useState } from "react";
import { motion } from "framer-motion";

const RecentPerformanceCard = ({ recentMatches, loading }) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(null);

  if (loading || !recentMatches?.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-3 flex items-center justify-center h-36">
        <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  const handleDotClick = (index) => {
    if (activeMatchIndex === index) {
      setActiveMatchIndex(null);
    } else {
      setActiveMatchIndex(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white shadow-md rounded-lg overflow-hidden h-full"
    >
      <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <h2 className="text-sm font-semibold">Your Recent Performance</h2>
        <p className="text-xs text-white mt-0.5">Last 7 matches</p>
      </div>
      
      <div className="p-3">
        {recentMatches.length === 0 ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-gray-500 text-sm">No recent completed matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1">
            {recentMatches.map((match, index) => (
              <div key={index} className="relative flex items-center py-1">
                <span className="text-xs font-medium w-24 truncate mr-1">
                  {match.matchShort}
                </span>
                <div 
                  className={`w-5 h-5 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 ml-auto
                  ${!match.hasPrediction ? "bg-gray-400" : 
                    match.teamCorrect ? "bg-green-500" : "bg-red-500"}`}
                  onClick={() => handleDotClick(index)}
                >
                  <span className="text-white text-xs">
                    {!match.hasPrediction ? "?" : match.teamCorrect ? "✓" : "✗"}
                  </span>
                </div>
                
                {/* Tooltip that appears when dot is clicked */}
                {activeMatchIndex === index && (
                  <div className="absolute right-6 top-0 z-10 bg-white p-2 border border-gray-200 shadow-md rounded-md w-52 text-xs">
                    <p className="font-semibold">{match.match}</p>
                    {match.hasPrediction ? (
                      <>
                        <p>
                          Team: <span className={`font-medium ${match.teamCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {match.teamCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </p>
                        <p>
                          POTM: <span className={`font-medium ${match.potmCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {match.potmCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-orange-600 font-medium">No prediction made</p>
                    )}
                    <p className="mt-1">Date: {match.date}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-2 text-xs gap-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 mr-1 rounded-full"></div>
            <span className="text-xs">Correct</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 mr-1 rounded-full"></div>
            <span className="text-xs">Incorrect</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 mr-1 rounded-full"></div>
            <span className="text-xs">No Prediction</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentPerformanceCard;