import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';

// Create an axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Create a new user (used for registration)
export const registerUser = async (userData) => {
  try {
    const response = await api.post(`/admin/api/logiciel/create-user`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user (simulated with get-user endpoint)
export const loginUser = async (credentials) => {
  try {
    // First get all users to find the matching username
    const allUsers = await getAllUsers();
    
    // If getAllUsers failed and returned an empty array, handle gracefully
    if (!allUsers || allUsers.length === 0) {
      console.error('Could not retrieve users list');
      throw new Error('Server error. Please try again later.');
    }
    
    const user = allUsers.find(u => u.username === credentials.username && u.password === credentials.password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Generate a simple token (in a real app, this would be done server-side)
    const token = btoa(JSON.stringify({
      userId: user._id || user.userID,
      username: user.username,
      role: user.role,
      img_url: user.img_url || '',
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiration
    }));
    
    return {
      user,
      token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user (client-side only since we don't have a server endpoint)
export const logoutUser = async () => {
  // Just return a success response since logout is handled client-side
  return { success: true, message: 'Logged out successfully' };
};

// Get current user from token
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { user: null };
    }
    
    try {
      // Decode the token to get user info
      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('authToken');
        return { user: null };
      }
      
      // Get the full user data from the server
      const response = await getUserById(decoded.userId);
      
      // If we couldn't get the user data, use the data from the token
      if (!response) {
        return { 
          user: {
            _id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            img_url: decoded.img_url
          } 
        };
      }
      
      return { user: response };
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      localStorage.removeItem('authToken');
      return { user: null };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null };
  }
};

// Check if user is authenticated
export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { authenticated: false };
    }
    
    try {
      // Decode the token
      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('authToken');
        return { authenticated: false };
      }
      
      return { authenticated: true };
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      localStorage.removeItem('authToken');
      return { authenticated: false };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    localStorage.removeItem('authToken');
    return { authenticated: false };
  }
};

// Import user API functions
import { getAllUsers as fetchAllUsers, getUserById as fetchUserById } from './user';

// Get all users (admin only) - wrapper around the user API function
export const getAllUsers = async () => {
  try {
    return await fetchAllUsers();
  } catch (error) {
    console.error('Error getting all users:', error);
    // Return empty array to prevent endless loading
    return [];
  }
};

// Get user by ID - wrapper around the user API function
export const getUserById = async (userId) => {
  try {
    return await fetchUserById(userId);
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    // Return null to prevent endless loading
    return null;
  }
};