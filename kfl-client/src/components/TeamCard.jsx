import React from "react";
import { motion } from "framer-motion";
import cskLogo from "../assets/csk-logo.png";
import miLogo from "../assets/mi-logo.png";
import rcbLogo from "../assets/rcb-logo.png";
import srhLogo from "../assets/srh-logo.png";
import kkrLogo from "../assets/kkr-logo.png";
import dcLogo from "../assets/dc-logo.png";
import pbksLogo from "../assets/pbks-logo.png";
import rrLogo from "../assets/rr-logo.png";
import gtLogo from "../assets/gt-logo.png";
import lsgLogo from "../assets/lsg-logo.png";


const TeamCard = ({ team, onSelect, colorGradient }) => {
   const getTeamLogo = (code) => {
     const teamLogos = {
       CSK: cskLogo,
       MI: miLogo,
       RCB: rcbLogo,
       SRH: srhLogo,
       KKR: kkrLogo,
       DC: dcLogo,
       PBKS: pbksLogo,
       RR: rrLogo,
       GT: gtLogo,
       LSG: lsgLogo,
     };
     return teamLogos[code] || null;
   };

   const teamLogo = getTeamLogo(team.code);
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
            <rect
              width="100"
              height="100"
              fill={`url(#pattern-${team.code})`}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative p-3 sm:p-6 flex flex-col text-white z-10 min-h-[180px] sm:min-h-[220px]">
          {/* Team Icon/Avatar */}
          <div className="flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 mb-1 sm:mb-2">
            {teamLogo ? (
              <img
                src={teamLogo}
                alt={`${team.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-lg sm:text-2xl font-bold text-gray-700">
                {team.code.substring(0, 2).toUpperCase()}
              </span>
            )}
           </div>

          {/* Team Info */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-xl font-bold mb-0.5 sm:mb-1 leading-tight">{team.name}</h3>
            <p className="text-xs sm:text-sm text-white text-opacity-90">{team.code}</p>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Player Count */}
          <div className="flex items-center justify-between pt-1 sm:pt-4 border-t border-white border-opacity-20 pb-2 sm:pb-6">
            <span className="text-xs sm:text-sm font-semibold">Players</span>
            <span className="text-lg sm:text-2xl font-bold">{team.playerCount}</span>
          </div>

          {/* Click Indicator */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-white text-opacity-70 text-[9px] sm:text-xs font-medium">
            Click to view →
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamCard;
