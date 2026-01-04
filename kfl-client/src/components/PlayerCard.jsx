import React, { useState } from "react";
import { motion } from "framer-motion";

const PlayerCard = ({ player, team, index, colorGradient }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Generate a consistent color based on player name
  const getPlayerInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden">
        {/* Header with gradient */}
        <div
          className={`h-24 bg-gradient-to-br ${colorGradient} relative flex items-end justify-center pb-3`}
        >
          {/* Avatar */}
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white"
          >
            {getPlayerInitials(player.name)}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 text-center mb-2 line-clamp-2">
            {player.name}
          </h3>

          {/* Team Badge */}
          <div className="flex justify-center mb-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${colorGradient}`}
            >
              {player.team}
            </span>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? "auto" : 0,
            }}
            transition={{ duration: 0.2 }}
            className="pt-3 border-t border-gray-200"
          >
            <p className="text-xs text-gray-600 text-center">
              Player • {team.name}
            </p>
          </motion.div>
        </div>

        {/* Footer Info - Always visible */}
        {/* <div className="px-4 py-2 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700">
            Team: <span className="text-blue-600 font-bold">{player.team}</span>
          </p>
        </div> */}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
