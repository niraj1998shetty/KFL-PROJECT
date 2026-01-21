import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Edit2,
  X,
  Copy,
  Check,
  Calendar,
  TrendingUp,
  Shield,
  LogOut,
} from "lucide-react";
import "../styles/ProfilePage.css";
import { capitalizeFirstLetter, capitalizeEachWord} from "../helpers/functions";
import LogoutConfirmModal from "../components/LogoutConfirmModal";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState(null);
  // const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    about: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; //Do not remove anywhere

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
        about: response.data.about,
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartEdit = (field) => {
    setEditingField(field);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profileData.name,
      about: profileData.about,
    });
    setEditingField(null);
    setError("");
  };

  const handleSaveField = async () => {
    if (editingField === "name" && !formData.name.trim()) {
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
      setEditingField(null);

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
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
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
      day: "numeric",
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
            <div className="editable-field-container">
              {editingField === "name" ? (
                <div className="inline-edit-wrapper-horizontal">
                  <div className="name-input-with-count">
                    <input
                      type="text"
                      name="name"
                      maxLength="25"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="profile-input-name-inline"
                      placeholder="Your name"
                      autoFocus
                    />
                    <p className="char-count">
                      {formData.name.length}/25 characters
                    </p>
                  </div>
                  <div className="inline-edit-actions">
                    <button
                      onClick={handleSaveField}
                      disabled={isSaving}
                      className="inline-action-btn save-btn"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-action-btn cancel-btn"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // </div>
                <div className="profile-name-display">
                  <h1 className="profile-name">
                    {capitalizeEachWord(profileData.name)}
                  </h1>
                  <button
                    onClick={() => handleStartEdit("name")}
                    className="inline-edit-icon"
                    title="Edit name"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
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
              {editingField !== "about" ? (
                <button
                  onClick={() => handleStartEdit("about")}
                  className="inline-edit-icon"
                  title="Edit about"
                >
                  <Edit2 size={16} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveField}
                    disabled={isSaving}
                    className="inline-action-btn save-btn"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-action-btn cancel-btn"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
            {editingField === "about" ? (
              <>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  className="profile-textarea"
                  placeholder="Tell something about yourself (optional)"
                  maxLength="85"
                  autoFocus
                />

                <p className="char-count">
                  {formData.about.length}/85 characters
                </p>
              </>
            ) : (
              <div className="info-value">
                {profileData.about || (
                  <span className="text-muted">No bio added yet</span>
                )}
              </div>
            )}
          </div>

          {/* Member Since */}
          <div className="profile-info-card">
            <div className="info-label-with-icon">
              <Calendar size={16} />
              <span>Member Since</span>
            </div>
            <div className="info-value">
              {formatDate(profileData.createdAt)}
            </div>
          </div>

          {/* Recovery Code Section */}
          <div className="profile-info-card recovery-code-card">
            <div className="info-label-with-icon">
              <Shield size={16} />
              <span>Password Recovery Code</span>
            </div>
            <p className="recovery-code-description">
              Use this code to reset or change your password if you forget it or want to change it. Keep it
              safe and don't share it with anyone.
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

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
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

export default ProfilePage;
