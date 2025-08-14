import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { loginUser, logoutUser, getCurrentUser, checkAuth } from '../api/auth';
import { updateUserById } from '../api/user';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        
        // Set a timeout to prevent endless loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication check timed out')), 8000);
        });
        
        // Race between the auth check and the timeout
        const response = await Promise.race([
          checkAuth(),
          timeoutPromise
        ]);
        
        if (response && response.authenticated) {
          try {
            const userResponse = await getCurrentUser();
            if (userResponse && userResponse.user) {
              setCurrentUser(userResponse.user);
            } else {
              throw new Error('Failed to get user data');
            }
          } catch (userErr) {
            console.error('Failed to get user data:', userErr);
            localStorage.removeItem('authToken');
            setCurrentUser(null);
          }
        } else {
          // Not authenticated
          localStorage.removeItem('authToken');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear any existing auth data
        localStorage.removeItem('authToken');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);
  
  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginUser({ username, password });
      
      // Store auth token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      }
      
      setCurrentUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has admin role
  const isAdmin = () => {
    return currentUser.role === 'admin';
  };
  
  // Check if user can access a specific page/feature
  const canAccess = (page) => {
    // Admin can access everything
    if (isAdmin()) return true;
    
    // Pages that employees cannot access
    const restrictedPages = ['caisse', 'employee/list', 'register', 'assistant-ia'];
    
    // Check if the current page is restricted
    return !restrictedPages.some(restrictedPage => page.includes(restrictedPage));
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser || !currentUser._id) {
        throw new Error('User not authenticated');
      }
      
      // Ensure we're using the correct ID for the update
      const userId = userData._id || currentUser._id;
      
      // Remove _id from userData to avoid MongoDB errors
      const { _id, ...dataToUpdate } = userData;
      
      const updatedUser = await updateUserById(userId, dataToUpdate);
      
      // Update the current user state with the new data
      setCurrentUser(prev => ({
        ...prev,
        ...updatedUser
      }));
      
      return updatedUser;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        isAdmin,
        canAccess,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook has been moved to src/hooks/useAuth.js