import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7)), url('/api/placeholder/1200/800')",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            {showResetForm
              ? "Enter the reset code sent to your mobile"
              : "Enter your mobile number to reset your password"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {success && !showResetForm && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        {!showResetForm ? (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="mobile"
              >
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                pattern="[6-9][0-9]{9}"
                maxLength="10"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered WhatsApp number
              </p>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                    Sending Code...
                  </span>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <div className="text-center">
            {resetToken && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Your reset code (Development):</p>
                <p className="text-2xl font-bold text-blue-600 font-mono tracking-widest">
                  {resetToken}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  (This is visible only in development mode)
                </p>
              </div>
            )}
            <p className="text-gray-700 mb-4">
              A reset code has been sent to <strong>{mobileNumber}</strong>
            </p>
            <Link
              to="/reset-password"
              state={{ mobileNumber }}
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
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
              className="mt-4 w-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-4 rounded"
            >
              Try Different Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
