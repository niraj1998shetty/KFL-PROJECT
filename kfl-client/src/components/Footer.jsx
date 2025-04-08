import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import prizePoolImage from '../assets/prize-pool-image.jpg';
import Fireworks from "fireworks-js";
const Footer = () => {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const openRulesModal = (e) => {
    e.preventDefault();
    setIsRulesModalOpen(true);
  };

  const closeRulesModal = () => {
    setIsRulesModalOpen(false);
  };

  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);

  const openPrizeModal = (e) => {
    e.preventDefault();
    setIsPrizeModalOpen(true);
  };

  const closePrizeModal = () => {
    setIsPrizeModalOpen(false);
  };
  const fireworksContainerRef = useRef(null); 


  useEffect(() => {
    if (isPrizeModalOpen && fireworksContainerRef.current) {
      const container = fireworksContainerRef.current;
      const fireworks = new Fireworks(container);
      fireworks.start();

      return () => fireworks.stop();
    }
  }, [isPrizeModalOpen]);




  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Cricket Prediction League
            </h3>
            <p className="text-gray-400">
              Join the excitement and show off your cricket knowledge by
              predicting match outcomes and players of the match.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                {" "}
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-300"
                  onClick={openRulesModal}
                >
                  Rules
                </a>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  to="/stats"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Statistics
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Posts
                </Link>
              </li>
               <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1YQRxSKM9WM2PVxmaOdNOQBaZVaScck1c7VzguJZldw4/edit?usp=sharing"
                  className="text-gray-400 hover:text-white transition duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Excel sheet leaderboard
                </a>
              </li>
              <li>
              <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-300"
                  onClick={openPrizeModal}
                >
                  Prize Pool
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/katthe_gang/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/katthe_gang/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>© 2025 Cricket Prediction League. All rights reserved.</p>
        </div>
      </div>

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
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
        >
          Close
        </button>
      </div>
     
      
    </div>
  </div>
  
)}
    </footer>
  );
};

export default Footer;
