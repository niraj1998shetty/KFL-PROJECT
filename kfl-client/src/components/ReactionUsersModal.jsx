import React, { useEffect, useRef, useState } from 'react';
import { getFirstName } from '../helpers/functions';

const ReactionUsersModal = ({ isOpen, onClose, emoji, position, users, currentUserId, allUsers }) => {
  const popupRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      // Close popup on any scroll
      onClose();
    };

    const handleTouchMove = () => {
      // Close popup on touch move (scrolling on mobile)
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && position && popupRef.current) {
      const popup = popupRef.current;
      const popupRect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Adjust horizontal position if out of bounds
      if (newX + popupRect.width > viewportWidth - 10) {
        newX = viewportWidth - popupRect.width - 10;
      }
      if (newX < 10) {
        newX = 10;
      }
      
      // Adjust vertical position if out of bounds
      if (newY - popupRect.height < 10) {
        // Show below instead of above
        newY = position.y + 40;
      }
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, position]);

  if (!isOpen || !position) return null;

  const totalUsers = allUsers ? allUsers.length : (users ? users.length : 0);
  const finalPosition = adjustedPosition || position;

  return (
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-[200px]"
      style={{
        left: `${finalPosition.x}px`,
        top: `${finalPosition.y}px`,
        transform: 'translateY(-100%) translateY(-8px)'
      }}
    >
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center gap-1 text-xs">
          <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs">
            All {totalUsers}
          </button>
          <button className="px-2 py-1 bg-gray-100 text-gray-800 rounded flex items-center gap-1 font-medium text-xs">
            <span className="text-sm">{emoji}</span>
            <span>{users ? users.length : 0}</span>
          </button>
        </div>
      </div>
      
      <div className="max-h-48 overflow-y-auto">
        {users && users.length > 0 ? (
          <div className="py-1">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center text-white font-semibold text-xs">
                    {getFirstName(user.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-800 font-medium truncate">
                      {user.userId === currentUserId ? 'You' : user.username}
                    </p>
                    {user.userId === currentUserId && (
                      <p className="text-[10px] text-gray-500">Click to remove</p>
                    )}
                  </div>
                </div>
                <span className="text-base ml-1">{emoji}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-3 text-xs">No reactions yet</p>
        )}
      </div>
    </div>
  );
};

export default ReactionUsersModal;