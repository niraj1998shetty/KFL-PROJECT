import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/AuthPages.css";

const ForgotPasswordPage = () => {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleForgotPassword = async (e) => {
    e.preventDefault();

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
        recoveryCode: recoveryCode.toUpperCase().trim()
      });

      setSuccess(response.data.message);
      setUserId(response.data.userId);
      setShowResetForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify recovery code. Please try again.");
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
              <h2>Forgot Password?</h2>
              <p>{showResetForm ? "Enter your new password" : "Enter your recovery code to reset your password"}</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && !showResetForm && <div className="success-message">{success}</div>}

            {!showResetForm ? (
              <form onSubmit={handleForgotPassword} className="auth-form">
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
              <div className="auth-form">
                <p className="text-center mb-6">
                  Your recovery code has been verified. You can now reset your password.
                </p>
                <Link
                  to="/reset-password"
                  state={{ userId }}
                  className="auth-button auth-button-primary"
                >
                  Reset Password
                </Link>
                <button
                  onClick={() => {
                    setShowResetForm(false);
                    setRecoveryCode("");
                    setSuccess("");
                    setError("");
                    setUserId(null);
                  }}
                  className="auth-button auth-button-secondary"
                >
                  Try Different Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
