import React from "react";

const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 animate-fade-in">
        
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-center space-x-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
