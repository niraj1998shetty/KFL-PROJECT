import React from "react";
import { motion } from "framer-motion";

const TeamCard = ({ team, onSelect, colorGradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <div className="relative h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorGradient} opacity-90`}
        />

        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 mix-blend-multiply">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id={`pattern-${team.code}`}
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#pattern-${team.code})`} />
          </svg>
        </div>

        {/* Content */}
        <div className="relative h-48 p-6 flex flex-col justify-between text-white z-10">
          {/* Team Icon/Avatar */}
          <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-2">
            <span className="text-2xl font-bold">
              {team.code.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Team Info */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold mb-1">{team.name}</h3>
            <p className="text-sm text-white text-opacity-90">
              {team.code}
            </p>
          </div>

          {/* Player Count */}
          <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
            <span className="text-sm font-semibold">Players</span>
            <span className="text-2xl font-bold">{team.playerCount}</span>
          </div>
        </div>

        {/* Click Indicator */}
        <div className="absolute bottom-3 right-3 text-white text-opacity-70 text-xs font-medium">
          Click to view →
        </div>
      </div>
    </motion.div>
  );
};

export default TeamCard;
