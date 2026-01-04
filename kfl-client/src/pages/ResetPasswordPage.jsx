import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/AuthPages.css";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const validateForm = () => {
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return false;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        userId,
        newPassword,
        confirmPassword
      });

      setSuccess(response.data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-layout">
            <div className="auth-logo-section">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <img
                  src={logo}
                  alt="KattheGang Fantasy League"
                  className="logo-image"
                />
                <div className="logo-shadow"></div>
              </div>
            </div>

            <div className="auth-form-section">
              <div className="form-header text-center">
                <h2>Invalid Access</h2>
                <p>Please go to the forgot password page first.</p>
              </div>

              <Link
                to="/forgot-password"
                className="auth-button auth-button-primary"
              >
                Go to Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-layout">
          {/* Logo Section */}
          <div className="auth-logo-section">
            <button
              onClick={() => navigate("/forgot-password")}
              className="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <div className="logo-container">
              <div className="logo-glow"></div>
              <img
                src={logo}
                alt="KattheGang Fantasy League"
                className="logo-image"
              />
              <div className="logo-shadow"></div>
            </div>
          </div>

          {/* Form Section */}
          <div className="auth-form-section">
            <div className="form-header text-center">
              <h2>Reset Password</h2>
              <p>Enter your new password</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="form-hint">Minimum 6 characters required</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="auth-footer">
                <p>
                  Remember your password?{" "}
                  <Link to="/login" className="auth-link">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
