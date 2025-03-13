import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Set axios auth header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          setCurrentUser(res.data);
        } catch (error) {
          console.error('Error loading user:', error);
          setToken(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (mobile, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { mobile, password });
      setToken(res.data.token);
      setCurrentUser(res.data);
      setAuthToken(res.data.token);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setAuthToken(null);
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      setToken(res.data.token);
      setCurrentUser(res.data);
      setAuthToken(res.data.token);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
