import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/AuthPages.css";

const ForgotPasswordPage = () => {
  const [mobile, setMobile] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Validate mobile number
    if (!mobile.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    // Validate recovery code format (should be provided)
    if (!recoveryCode.trim()) {
      setError("Please enter your recovery code");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        mobile: mobile.trim(),
        recoveryCode: recoveryCode.toUpperCase().trim()
      });

      setUserId(response.data.userId);
      setShowResetForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify recovery code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
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

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-layout">
          {/* Logo Section */}
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

          {/* Form Section */}
          <div className="auth-form-section">
            <div className="form-header text-center">
              <h2>{showResetForm ? "Reset Password" : "Forgot Password?"}</h2>
              <p>{showResetForm ? "Enter your new password" : "Enter your mobile number and recovery code"}</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!showResetForm ? (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="mobile" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    type="text"
                    className="form-input"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recoveryCode" className="form-label">
                    Recovery Code
                  </label>
                  <input
                    id="recoveryCode"
                    type="text"
                    className="form-input"
                    placeholder="Enter your 12-character recovery code"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    maxLength="12"
                    required
                  />
                  <p className="form-hint">You can get your recovery code from the admin</p>
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    "Verify Recovery Code"
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
            ) : (
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

                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setMobile("");
                    setRecoveryCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setSuccess("");
                    setError("");
                    setUserId(null);
                  }}
                  className="auth-button auth-button-secondary"
                >
                  Back to Verification
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
