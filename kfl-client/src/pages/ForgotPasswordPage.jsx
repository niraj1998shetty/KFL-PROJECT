import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/AuthPages.css";

const ForgotPasswordPage = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Validate mobile number format (10 digits)
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        mobile: mobileNumber
      });

      setSuccess(response.data.message);
      // Show reset token in development mode
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setShowResetForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
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
              <p>{showResetForm ? "Enter the reset code sent to your mobile" : "Enter your mobile number to reset your password"}</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && !showResetForm && <div className="success-message">{success}</div>}

            {!showResetForm ? (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="mobile" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    className="form-input"
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    pattern="[6-9][0-9]{9}"
                    maxLength="10"
                    required
                  />
                  <p className="form-hint">Enter your registered WhatsApp number</p>
                </div>

                <button
                  type="submit"
                  className="auth-button auth-button-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    "Send Reset Code"
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
                {resetToken && (
                  <div className="reset-token-box">
                    <p className="reset-token-label">Your reset code (Development):</p>
                    <p className="reset-token-value">{resetToken}</p>
                    <p className="reset-token-note">(This is visible only in development mode)</p>
                  </div>
                )}
                <p className="text-center mb-6">
                  A reset code has been sent to <strong>{mobileNumber}</strong>
                </p>
                <Link
                  to="/reset-password"
                  state={{ mobileNumber }}
                  className="auth-button auth-button-primary"
                >
                  Enter Reset Code
                </Link>
                <button
                  onClick={() => {
                    setShowResetForm(false);
                    setMobileNumber("");
                    setResetToken("");
                    setSuccess("");
                    setError("");
                  }}
                  className="auth-button auth-button-secondary"
                >
                  Try Different Number
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
