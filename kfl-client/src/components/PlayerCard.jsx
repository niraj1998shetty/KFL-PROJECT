import React, { useState } from "react";
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

const PlayerCard = ({ player, team, index, colorGradient }) => {
  const [isHovered, setIsHovered] = useState(false);
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
        {/* Header */}
        <div
          className={`h-24 bg-gradient-to-br ${colorGradient} relative flex items-end justify-center pb-3`}
        >
          {/* Avatar */}
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="w-16 h-16 rounded-full  flex items-center justify-center  font-bold text-lg shadow-lg border-2 border-white"
          >
            {teamLogo ? (
              <img
                src={teamLogo}
                alt={`${player.team} logo`}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-700">
                {getPlayerInitials(player.name)}
              </span>
            )}
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
      </div>
    </motion.div>
  );
};

export default PlayerCard;
