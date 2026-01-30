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
import batIcon from "../assets/icons/bat.png";
import ballIcon from "../assets/icons/ball.png";
import glovesIcon from "../assets/icons/gloves.png";
import allround from "../assets/icons/all-rounder.png";




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
  const getRoleIcons = (role) => {
    switch (role) {
      case "Batter":
        return <img src={batIcon} alt="Batter" className="w-4 h-4 ml-2" />;

      case "Bowler":
        return <img src={ballIcon} alt="Bowler" className="w-4 h-4 ml-2" />;

      case "All-Rounder":
        return<img src={allround} alt="Bat" className="w-4 h-4 ml-2" />;
        
      case "Wk-Batter":
        return (
          <div className="flex gap-1 ml-2">
            <img src={glovesIcon} alt="Gloves" className="w-4 h-4" />
           
          </div>
        );

      default:
        return null;
    }
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
          className={`h-16 sm:h-24 bg-gradient-to-br ${colorGradient} relative flex items-end justify-center pb-3`}
        >
          {/* Avatar */}
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="w-10 h-10 sm:w-16 sm:h-16 rounded-full  flex items-center justify-center  font-bold text-lg shadow-lg border-2 border-white"
          >
            {teamLogo ? (
              <img
                src={teamLogo}
                alt={`${player.team} logo`}
                className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-700">
                {getPlayerInitials(player.name)}
              </span>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 text-center mb-2 line-clamp-2">
            {player.name}
          </h3>

          {/* Team Badge */}
          <div className="flex justify-center mb-3">
            <span
              className={`flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r ${colorGradient}`}
            >
              {player.role || player.team}
              {getRoleIcons(player.role)}
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
            className="pt-0 sm:pt-3 border-t border-gray-200"
          >
            <div className="text-center">
              <p className="text-xs text-gray-500">
                No. of MOM since 2025
              </p>
              <p className="text-xs font-bold text-gray-800">
                {player.momfrom25}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
