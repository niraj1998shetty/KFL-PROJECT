import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Home, 
  Trophy, 
  BarChart2, 
  MessageSquare, 
  Menu,
  X
} from "lucide-react";
import prizePoolImage from '../assets/prize-pool-image.jpg';
import Fireworks from "fireworks-js";
import axios from "axios";

const Footer = () => {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isOtherMenuOpen, setIsOtherMenuOpen] = useState(false);
  const [unreadPostsCount, setUnreadPostsCount] = useState(0);
  const fireworksContainerRef = useRef(null);
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; //Do not remove

  useEffect(() => {
    // Listen for modal events from sidebar
    const handleOpenModal = (event) => {
      const { modalName } = event.detail;
      if (modalName === 'rules') {
        setIsRulesModalOpen(true);
      } else if (modalName === 'prize') {
        setIsPrizeModalOpen(true);
      }
    };

    // Listen for unread posts updates
    const handleUnreadPostsUpdate = (event) => {
      setUnreadPostsCount(event.detail.count);
    };

    window.addEventListener('openModal', handleOpenModal);
    window.addEventListener('unreadPostsUpdate', handleUnreadPostsUpdate);
    
    // Fetch unread posts count on component mount
    fetchUnreadPostsCount();
    
    return () => {
      window.removeEventListener('openModal', handleOpenModal);
      window.removeEventListener('unreadPostsUpdate', handleUnreadPostsUpdate);
    };
  }, []);

  const fetchUnreadPostsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/posts/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadPostsCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread posts count:", error);
    }
  };

  useEffect(() => {
    if (isPrizeModalOpen && fireworksContainerRef.current) {
      const container = fireworksContainerRef.current;
      const fireworks = new Fireworks(container);
      fireworks.start();

      return () => fireworks.stop();
    }
  }, [isPrizeModalOpen]);

  // Close the mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOtherMenuOpen(false);
      }
    }

    if (isOtherMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOtherMenuOpen]);

  const closeRulesModal = () => {
    setIsRulesModalOpen(false);
  };

  const closePrizeModal = () => {
    setIsPrizeModalOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Mobile navigation items
  const mobileNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { path: "/stats", label: "Statistics", icon: <BarChart2 className="w-5 h-5" /> },
    { 
      path: "/posts", 
      label: "Posts", 
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadPostsCount > 0 ? unreadPostsCount : null
    },
    { 
      label: "More", 
      icon: <Menu className="w-5 h-5" />, 
      isMenu: true
    },
  ];

  // Other menu items (for mobile)
  const otherMenuItems = [
    { 
      label: "Teams & Players", 
      path: "/teams-players",
      action: () => setIsOtherMenuOpen(false)
    },
    { 
      label: "IPL Results", 
      path: "/match-results",
      action: () => setIsOtherMenuOpen(false)
    },
    { 
      label: "Prize Pool", 
      action: () => {
        setIsPrizeModalOpen(true);
        setIsOtherMenuOpen(false);
      } 
    },
    { 
      label: "Rules", 
      action: () => {
        setIsRulesModalOpen(true);
        setIsOtherMenuOpen(false);
      } 
    },
    { 
      label: "Excel Sheet Leaderboard", 
      external: true,
      href: "https://docs.google.com/spreadsheets/d/1YQRxSKM9WM2PVxmaOdNOQBaZVaScck1c7VzguJZldw4/edit?usp=sharing" 
    },
    { 
      label: "Instagram", 
      external: true,
      href: "https://www.instagram.com/katthe_gang/" 
    },
  ];

  return (
    <>
      {/* Desktop Footer */}
      <footer className="bg-gray-800 text-white p-6 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-sm">© 2025 Cricket Prediction League. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-800 text-white shadow-lg z-40">
        <div className="grid grid-cols-5">
          {mobileNavItems.map((item, index) => (
            item.isMenu ? (
              <button
                key={index}
                onClick={() => setIsOtherMenuOpen(!isOtherMenuOpen)}
                className={`flex flex-col items-center justify-center py-3 px-1 ${
                  isOtherMenuOpen ? "text-blue-400" : "text-gray-400"
                } hover:text-white`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ) : (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 px-1 relative ${
                  isActive(item.path) ? "text-indigo-600" : "text-gray-400"
                } hover:text-white`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                
                {/* Notification Badge */}
                {item.badge && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            )
          ))}
        </div>

        {/* Mobile Other Menu */}
        {isOtherMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="absolute bottom-16 right-0 bg-gray-900 rounded-t-lg shadow-lg p-4 w-64 z-50"
          >
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
              <h3 className="font-medium text-white">Other Links</h3>
              <button onClick={() => setIsOtherMenuOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {otherMenuItems.map((item, index) => (
                item.external ? (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white py-2"
                    onClick={() => setIsOtherMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : item.path ? (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={item.action}
                    className="block text-gray-400 hover:text-white py-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={item.action}
                    className="block text-gray-400 hover:text-white py-2 w-full text-left"
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeRulesModal}
          ></div>

          {/* Modal Content */}
          <div className="bg-white text-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Rules</h2>
              <button
                onClick={closeRulesModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">1️⃣ Basic Scoring:</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Predicting the correct winning team earns 5 points.</li>
                  <li>
                    Predicting the correct Man of the Match (MOM) earns 4
                    points.
                  </li>
                  <li>If the prediction is wrong, no points are awarded.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">2️⃣ Weekly Bonus Points:</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    The participant with the highest points in a week earns +2
                    bonus points.
                  </li>
                  <li>
                    The participant with the lowest points in a week loses -2
                    bonus points.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">3️⃣ Extra Bonus Points:</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    If there is only one correct predictor in a match (out of
                    All players), that person earns +4 extra points.
                  </li>
                  <li>
                    If a team wins by more than 100 runs, predictors of that
                    team earn +2 extra points.
                  </li>
                  <li>
                    If a team wins with all 10 wickets in hand, predictors of
                    that team earn +2 extra points.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">
                  4️⃣ Semi-Final Qualification Prediction Bonus:
                </h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    If you correctly predict 4 out of 5 teams that qualify for
                    the semi-finals, you win 10 BONUS POINTS.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">5️⃣ Semifinal Match Points:</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Correct winning team prediction: 7 points</li>
                  <li>Correct MOM prediction: 5 points</li>
                  <li>
                    If only one participant predicts correctly, they earn 5
                    bonus points.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">6️⃣ Final Match Points:</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Correct winning team prediction: 10 points</li>
                  <li>Correct MOM prediction: 7 points</li>
                  <li>
                    If only one participant predicts correctly, they earn 5
                    bonus points.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={closeRulesModal}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Prize Pool Modal */}
      {isPrizeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closePrizeModal}
          >
            <div
              ref={fireworksContainerRef}
            ></div>
          </div>
          
          {/* Modal Content */}
          <div className="bg-white text-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Prize Pool</h2>
              <button
                onClick={closePrizeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4" >
              <div className="text-center mb-4">
                <img
                  src={prizePoolImage}
                  alt="Prize Pool"
                  className="rounded-lg shadow-lg max-w-full h-auto"
                /> 
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={closePrizeModal}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;