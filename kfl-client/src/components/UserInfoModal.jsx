import React, { useState, useEffect } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "../helpers/functions";

const UserInfoModal = ({ isOpen, onClose, userId, userName, userMobile }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserStats();
    }
  }, [isOpen, userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/predictions/user-stats/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserStats(response.data.userStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0  backdrop-blur-sm  bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10 relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-lg relative">
          <h2 className="text-lg font-semibold">User Information</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
            </div>
          ) : userStats ? (
            <>
              {/* User Avatar and Name */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {capitalizeFirstLetter(userName || "User")}
                  </h3>
                  <p className="text-sm text-gray-500">User Profile</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Mobile Number:
                  </span>
                  <span className="text-sm text-gray-900">
                    {userMobile || userStats.mobile || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Total Points:
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {userStats.totalPoints || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Week Points:
                  </span>
                  <span className="text-sm text-gray-900">
                    {userStats.weekPoints || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    Correct Predictions:
                  </span>
                  <span className="text-sm text-gray-900">
                    {userStats.correctPredictions || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-gray-600">
                    Accuracy:
                  </span>
                  <span className="text-sm text-gray-900">
                    {userStats.accuracy
                      ? `${userStats.accuracy.toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No user data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
