import React from "react";
import { capitalizeFirstLetter } from "../helpers/functions";

const UserInfoModal = ({ isOpen, onClose, user, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">User Information</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
          </div>
        ) : user ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {capitalizeFirstLetter(user.name)}
                </h3>
                <p className="text-sm text-gray-500">User Profile</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Mobile Number:</span>
                <span className="text-sm text-gray-900">{user.mobile || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Points:</span>
                <span className="text-sm font-semibold text-indigo-600">{user.totalPoints || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Week Points:</span>
                <span className="text-sm text-gray-900">{user.weekPoints || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Correct Predictions:</span>
                <span className="text-sm text-gray-900">{user.correctPredictions || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Accuracy:</span>
                <span className="text-sm text-gray-900">{user.accuracy || 0}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No user data available
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
