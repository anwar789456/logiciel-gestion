// src/api/user.js
import axios from 'axios';

const API_BASE_URL = 'https://www.samethome.com';
const API_URL = `${API_BASE_URL}/admin/api/logiciel`;

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/get-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Create new user (admin only)
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/create-user`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user by ID
export const updateUserById = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/update-user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user by ID (admin only)
export const deleteUserById = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/delete-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};