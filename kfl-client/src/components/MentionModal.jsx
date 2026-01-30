import React from "react";
import "../styles/MentionModal.css";

const MentionModal = ({
  users,
  onSelectUser,
  isOpen,
  position,
  searchQuery,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="mention-modal"
      style={{
        top: `${position?.top || 0}px`,
        left: `${position?.left || 0}px`,
      }}
    >
      <div className="mention-modal-header">
        <p className="mention-modal-title">Mention Users</p>
      </div>
      <div className="mention-modal-content">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className="mention-user-item"
              onClick={() => onSelectUser(user)}
            >
              <div className="mention-user-avatar">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="mention-user-info">
                <p className="mention-user-name">{user.name}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="mention-no-results">
            {searchQuery ? `No users found for "${searchQuery}"` : "No users available"}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentionModal;
