import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";
import "../styles/AuthPages.css";

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validating mbl number format (10 dig)
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(mobileNumber, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
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
            {/* <div className="brand-text">
              <div className="brand-title">KattheGang</div>
              <div className="brand-subtitle">Fantasy League</div>
            </div> */}
          </div>

          {/* Form Section */}
          <div className="auth-form-section">
            <div className="form-header text-center">
              <h2>Sign-In</h2>
              <p>Sign in to access your dashboard and predictions</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
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
                <p className="form-hint">Enter your WhatsApp number</p>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="mb-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="auth-footer">
                <p>
                  Don't have an account?{" "}
                  <Link to="/register" className="auth-link">
                    Sign Up
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

export default LoginPage;
