import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';
import SemifinalPredictionModal from './SemifinalPredictionModal';
import SemifinalPredictionViewModal from './SemifinalPredictionViewModal';
import axios from 'axios';

const TopBar = () => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSemifinalOptions, setShowSemifinalOptions] = useState(false);
  const [showSemifinalPredictionModal, setShowSemifinalPredictionModal] = useState(false);
  const [showSemifinalViewModal, setShowSemifinalViewModal] = useState(false);
  const [hasSemifinalPrediction, setHasSemifinalPrediction] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [predictionTeams, setPredictionTeams] = useState(['', '', '', '', '']);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const checkSemifinalPrediction = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get(`${API_URL}/semifinals/me`);
        if (response.status === 200) {
          setHasSemifinalPrediction(true);
          setPredictionTeams(response.data.teams);
        }
      } catch (error) {
        // If 404 error (no prediction found), that's expected for new users
        if (error.response && error.response.status !== 404) {
          console.error('Error checking semifinal prediction:', error);
        }
        setHasSemifinalPrediction(false);
      }
    };
  
    if (currentUser) {
      checkSemifinalPrediction();
    }
  // Using a stable identifier for currentUser, not the entire object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id || currentUser?.mobile, showSemifinalPredictionModal]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSemifinalPredictionSubmit = async (selectedTeams) => {
    try {
      // Use POST for new predictions and PUT for updates
      const method = isEditing ? 'put' : 'post';
      const response = await axios[method](`${API_URL}/semifinals`, {
        teams: selectedTeams
      });
      
      setShowSemifinalPredictionModal(false);
      setShowSemifinalOptions(false);
      setHasSemifinalPrediction(true);
      setToastMessage(isEditing ? 'Semifinal prediction updated successfully!' : 'Semifinal prediction submitted successfully!');
      setShowToast(true);
      setIsEditing(false);
      
      // 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting semifinal prediction:', error);
      setToastMessage(`Error: ${error.response?.data?.message || 'Unknown error'}`);
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
      console.error('Error fetching current prediction:', error);
      setToastMessage(`Error: ${error.response?.data?.message || 'Unknown error'}`);
      setShowToast(true);
    }
  };

  return (
    <>
      <div className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-bold text-xl">KattheGang Fantasy League</div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition duration-300"
                  onClick={() => setShowSemifinalOptions(!showSemifinalOptions)}
                >
                  Semifinal Prediction
                </button>
                
                {showSemifinalOptions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                    {!hasSemifinalPrediction && (
                      <button
                        onClick={() => {
                          setPredictionTeams(['', '', '', '', '']);
                          setShowSemifinalPredictionModal(true);
                          setShowSemifinalOptions(false);
                        }}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                      >
                        Give Semifinal Prediction
                      </button>
                    )}
                    {hasSemifinalPrediction && (
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
              
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-indigo-600 transition duration-300 focus:outline-none"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <User className="h-6 w-6" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-gray-500">{currentUser.mobile}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
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
    </>
  );
};

export default TopBar;
