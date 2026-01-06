import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit2, Copy, Check, Calendar, TrendingUp, Shield, LogOut } from "lucide-react";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    about: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";//Do not remove anywhere

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/profile`);
      setProfileData(response.data);
      setFormData({
        name: response.data.name,
        about: response.data.about
      });
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const response = await axios.put(`${API_URL}/users/profile`, formData);
      
      setProfileData(response.data.user);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (profileData?.recoveryCode) {
      navigator.clipboard.writeText(profileData.recoveryCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const calculateWinPercentage = () => {
    if (!profileData) return 0;
    // This would need actual prediction data
    // For now returning a placeholder based on points
    return Math.min(Math.round((profileData.points / 100) * 100), 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

    return (
  <>
      <div className="profile-wrapper">
        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {getInitials(profileData.name)}
            </div>
            <h1 className="profile-name">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-input-name"
                  placeholder="Your name"
                />
              ) : (
                profileData.name
              )}
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-profile-btn"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Mobile Number Card */}
          <div className="profile-info-card">
            <div className="info-label">Mobile Number</div>
            <div className="info-value">{profileData.mobile}</div>
          </div>

          {/* About Section */}
          <div className="profile-info-card">
            <div className="info-label-with-icon">
              <span>About</span>
            </div>
            {isEditing ? (
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                className="profile-textarea"
                placeholder="Tell something about yourself (optional)"
                maxLength="200"
              />
            ) : (
              <div className="info-value">
                {profileData.about || (
                  <span className="text-muted">No bio added yet</span>
                )}
              </div>
            )}
            {isEditing && (
              <p className="char-count">
                {formData.about.length}/200 characters
              </p>
            )}
          </div>

          {/* Stats Grid */}
          {/* <div className="profile-stats-grid">
            <div className="stat-card">
              <div className="stat-icon points">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Points</div>
                <div className="stat-value">{profileData.points}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon week-points">
                <Shield size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Weekly Points</div>
                <div className="stat-value">{profileData.weekPoints}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon win-percentage">
                <span className="percentage-icon">%</span>
              </div>
              <div className="stat-content">
                <div className="stat-label">Win Percentage</div>
                <div className="stat-value">{calculateWinPercentage()}%</div>
              </div>
            </div>
          </div> */}

          {/* Member Since */}
          <div className="profile-info-card">
            <div className="info-label-with-icon">
              <Calendar size={16} />
              <span>Member Since</span>
            </div>
            <div className="info-value">{formatDate(profileData.createdAt)}</div>
          </div>

          {/* Recovery Code Section */}
          <div className="profile-info-card recovery-code-card">
            <div className="info-label-with-icon">
              <Shield size={16} />
              <span>Recovery Code</span>
            </div>
            <p className="recovery-code-description">
              Use this code to reset your password if you forget it. Keep it safe and don't share it with anyone.
            </p>
            <div className="recovery-code-display">
              <div className="recovery-code-value">
                {profileData.recoveryCode}
              </div>
              <button
                onClick={handleCopyCode}
                className={`copy-btn ${copiedCode ? "copied" : ""}`}
              >
                {copiedCode ? (
                  <>
                    <Check size={16} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="profile-actions">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: profileData.name,
                    about: profileData.about
                  });
                  setError("");
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn-save"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
            </div>
            </>
  );
};

export default ProfilePage;
