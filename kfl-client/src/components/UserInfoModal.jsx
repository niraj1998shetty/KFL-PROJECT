import React, { useState, useEffect } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "../helpers/functions";

const UserInfoModal = ({ isOpen, onClose, user }) => {

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

 

 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0  backdrop-blur-sm  bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 z-10 relative">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-lg relative">
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
          {user ? (
            <>
              {/* User Avatar and Name */}
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {capitalizeFirstLetter(user.name)}
                  </h3>
                  <p className="text-sm text-gray-500">User Profile</p>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">
                    Mobile Number:
                  </span>
                  <span className="text-sm text-gray-900">
                    {user.mobile ?? "-"}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span>Total Points:</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {user.totalPoints ?? "-"}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span>Team Win:</span>
                  <span>
                    {user.correctPredictions ?? "-"} (
                    {user.accuracy != null
                      ? `${user.accuracy.toFixed(1)}%`
                      : "-"}
                    )
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span>POTM:</span>
                  <span>{user.correctPotmPredictions ?? "-"}</span>
                </div>

                <div className="flex justify-between py-2">
                  <span>Both:</span>
                  <span>{user.bothCorrectPredictions ?? "-"}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span>No Prediction:</span>
                  <span>{user.noPredictionCount ?? "-"}</span>
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
