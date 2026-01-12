import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, ArrowLeft } from "lucide-react";
import SemifinalPredictionModal from "./SemifinalPredictionModal";
import SemifinalPredictionViewModal from "./SemifinalPredictionViewModal";
import logo from '../assets/logo.png';
import axios from "axios";
import LogoutConfirmModal from "../components/LogoutConfirmModal";


const TopBar = ({ showProfile = false }) => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSemifinalOptions, setShowSemifinalOptions] = useState(false);
  const [showSemifinalPredictionModal, setShowSemifinalPredictionModal] =
    useState(false);
  const [showSemifinalViewModal, setShowSemifinalViewModal] = useState(false);
  const [hasSemifinalPrediction, setHasSemifinalPrediction] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [predictionTeams, setPredictionTeams] = useState(["", "", "", "", ""]);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [editingAllowed, setEditingAllowed] = useState(false);

  const profileMenuRef = useRef(null);
  const semifinalOptionsRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const checkSemifinalPrediction = async () => {
      if (!currentUser) return;

      try {
        await checkEditingAllowed();

        const response = await axios.get(`${API_URL}/semifinals/me`);
        if (response.status === 200) {
          setHasSemifinalPrediction(true);
          setPredictionTeams(response.data.teams);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error("Error checking semifinal prediction:", error);
        }
        setHasSemifinalPrediction(false);
      }
    };

    if (currentUser) {
      checkSemifinalPrediction();
    }
  }, [currentUser?.id || currentUser?.mobile, showSemifinalPredictionModal]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        semifinalOptionsRef.current &&
        !semifinalOptionsRef.current.contains(event.target)
      ) {
        setShowSemifinalOptions(false);
      }
    }

    if (showProfileMenu || showSemifinalOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, showSemifinalOptions]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const checkEditingAllowed = async () => {
    try {
      const response = await axios.get(`${API_URL}/semifinals/editing-allowed`);
      setEditingAllowed(response.data.allowed);
    } catch (error) {
      console.error("Error checking if editing is allowed:", error);
      setEditingAllowed(false);
    }
  };

  const handleSemifinalPredictionSubmit = async (selectedTeams) => {
    try {
      // Use POST for new predictions and PUT for updates
      const method = isEditing ? "put" : "post";
      const response = await axios[method](`${API_URL}/semifinals`, {
        teams: selectedTeams,
      });

      setShowSemifinalPredictionModal(false);
      setShowSemifinalOptions(false);
      setHasSemifinalPrediction(true);
      setToastMessage(
        isEditing
          ? "Semifinal prediction updated successfully!"
          : "Semifinal prediction submitted successfully!"
      );
      setShowToast(true);
      setIsEditing(false);

      // 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting semifinal prediction:", error);
      setToastMessage(
        `Error: ${error.response?.data?.message || "Unknown error"}`
      );
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleEditPrediction = async () => {
    try {
      // Fetch the current prediction from API
      const response = await axios.get(`${API_URL}/semifinals/me`);
      setPredictionTeams(response.data.teams);
      setIsEditing(true);
      setShowSemifinalPredictionModal(true);
    } catch (error) {
      console.error("Error fetching current prediction:", error);
      setToastMessage(
        `Error: ${error.response?.data?.message || "Unknown error"}`
      );
      setShowToast(true);
    }
  };

  const ProfileMenu = () => (
    <div className="relative" ref={profileMenuRef}>
      <button
        className="p-2 rounded-full hover:bg-purple-800 hover:bg-opacity-50 transition duration-300 focus:outline-none"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
      >
        <User className="h-6 w-6" />
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={() => {
              navigate("/profile");
              setShowProfileMenu(false);
            }}
            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          
          <button
            onClick={() => {
              setShowLogoutConfirm(true);
              setShowProfileMenu(false);
            }}
            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {showProfile ? (
              // Profile Page Header
              <>
                {/* MOBILE HEADER */}
                <div className="flex md:hidden items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-full hover:bg-indigo-800 hover:bg-opacity-50 transition duration-300 focus:outline-none"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>

                    <span className="text-lg font-bold">Profile</span>
                  </div>

                  <ProfileMenu />
                </div>

                {/* DESKTOP HEADER (UNCHANGED) */}
                <div className="hidden md:flex items-center space-x-25">
                  <div className="h-12 w-12">
                    <img
                      src={logo}
                      alt="KattheGang Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-indigo-800 hover:bg-opacity-50 transition duration-300 focus:outline-none mr-2"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>

                  <span className="text-xl font-bold">Profile</span>
                </div>

                {/* DESKTOP PROFILE ICON */}
                <div className="hidden md:block">
                  <ProfileMenu />
                </div>
              </>
            ) : (
              // Default Header
              <>
                <div className="flex items-center flex-shrink-0 gap-2">
                  <div className="h-12 w-12 flex-shrink-0">
                    <img
                      src={logo}
                      alt="KattheGang Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="font-bold whitespace-nowrap">
                    <span className="hidden md:inline text-xl">
                      KattheGang Fantasy League
                    </span>
                    <span className="md:hidden text-xl">KFL</span>
                  </div>
                </div>

                <div className="flex-grow"></div>

                <div className="flex items-center space-x-1">
                  <div className="relative" ref={semifinalOptionsRef}>
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-800 hover:bg-opacity-50 transition duration-300 whitespace-nowrap"
                      onClick={() =>
                        setShowSemifinalOptions(!showSemifinalOptions)
                      }
                    >
                      Semifinal Prediction
                    </button>

                    {showSemifinalOptions && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                        {!hasSemifinalPrediction && editingAllowed && (
                          <button
                            onClick={() => {
                              setPredictionTeams(["", "", "", "", ""]);
                              setShowSemifinalPredictionModal(true);
                              setShowSemifinalOptions(false);
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                          >
                            Give Semifinal Prediction
                          </button>
                        )}
                        {hasSemifinalPrediction && editingAllowed && (
                          <button
                            onClick={() => {
                              handleEditPrediction();
                              setShowSemifinalOptions(false);
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                          >
                            Edit Your Prediction
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowSemifinalViewModal(true);
                            setShowSemifinalOptions(false);
                          }}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                        >
                          View All Predictions
                        </button>
                      </div>
                    )}
                  </div>

                  <ProfileMenu />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showToast && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
          {toastMessage}
        </div>
      )}

      {showSemifinalPredictionModal && (
        <SemifinalPredictionModal
          onClose={() => {
            setShowSemifinalPredictionModal(false);
            setIsEditing(false);
          }}
          onSubmit={handleSemifinalPredictionSubmit}
          initialTeams={predictionTeams}
        />
      )}

      {showSemifinalViewModal && (
        <SemifinalPredictionViewModal
          onClose={() => setShowSemifinalViewModal(false)}
          currentUser={currentUser}
        />
      )}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
      />
    </>
  );
};

export default TopBar;
