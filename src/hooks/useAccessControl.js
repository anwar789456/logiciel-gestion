import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Custom hook to control UI elements based on user access rights
 * @returns {Object} Access control functions
 */
export const useAccessControl = () => {
  const { hasReadWriteAccess, isAdmin } = useAuth();
  const location = useLocation();
  
  // Get current route path without leading slash
  const currentPath = location.pathname.substring(1);
  
  /**
   * Check if the current user can perform write operations on the current route
   * @returns {boolean} True if user has write access, false otherwise
   */
  const canWrite = () => {
    // Admin can always write
    if (isAdmin()) return true;
    
    // Check if user has read-write access to the current route
    return hasReadWriteAccess(currentPath);
  };
  
  /**
   * Conditionally render UI elements based on write access
   * @param {ReactNode} element - The UI element to conditionally render
   * @returns {ReactNode|null} The element if user has write access, null otherwise
   */
  const showIfCanWrite = (element) => {
    return canWrite() ? element : null;
  };
  
  return {
    canWrite,
    showIfCanWrite
  };
};