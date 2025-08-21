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
    return currentUser && currentUser.role === 'admin';
  };
  
  // Check if user has read-write access to a specific route
  const hasReadWriteAccess = (route) => {
    // Admin has read-write access to everything
    if (isAdmin()) return true;
    
    // If user has access_routes defined, check those permissions
    if (currentUser && currentUser.access_routes && currentUser.access_routes.length > 0) {
      // Find the route in user's access_routes
      // With flat routes, we can do a direct comparison
      const routeAccess = currentUser.access_routes.find(r => {
        // Remove leading slash if present for consistent comparison
        const normalizedRoute = route.startsWith('/') ? route.substring(1) : route;
        const normalizedAccessRoute = r.access_route.startsWith('/') ? r.access_route.substring(1) : r.access_route;
        
        return normalizedAccessRoute === normalizedRoute;
      });
      
      // Check if user has read-write access
      return routeAccess && routeAccess.access_right === 'read and write';
    }
    
    // Default to false if access_routes is not defined or route not found
    return false;
  };
  
  // Check if user can access a specific page/feature
  const canAccess = (page) => {
    // Admin can access everything
    if (isAdmin()) return true;
    
    // If user has access_routes defined, check those permissions
    if (currentUser && currentUser.access_routes && currentUser.access_routes.length > 0) {
      // Find if user has access to this route
      // With flat routes, we can do a direct comparison
      const routeAccess = currentUser.access_routes.find(route => {
        // Remove leading slash if present for consistent comparison
        const normalizedPage = page.startsWith('/') ? page.substring(1) : page;
        const normalizedAccessRoute = route.access_route.startsWith('/') ? route.access_route.substring(1) : route.access_route;
        
        return normalizedAccessRoute === normalizedPage;
      });
      
      // If route is found in user's access_routes, they have some level of access
      return !!routeAccess;
    }
    
    // Fallback to old behavior if access_routes is not defined
    // Pages that employees cannot access by default - updated for flat routes
    const restrictedPages = [];
    
    // Check if the current page is restricted
    // Remove leading slash if present for consistent comparison
    const normalizedPage = page.startsWith('/') ? page.substring(1) : page;
    return !restrictedPages.some(restrictedPage => normalizedPage === restrictedPage);
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
        hasReadWriteAccess,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook has been moved to src/hooks/useAuth.js