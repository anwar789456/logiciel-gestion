import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatItems, setChatItems] = useState([]);
  const [newMessageNotification, setNewMessageNotification] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
    const newSocket = io('https://www.samethome.com', {
      path: '/admin/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected successfully:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      console.error('Error details:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔴 Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('🔴 Reconnection failed after maximum attempts');
    });

    // Listen for chat updates
    newSocket.on('chatlogs-updated', (updatedChatItems) => {
      console.log('Received chat update:', updatedChatItems);
      
      // Store previous count to detect new messages
      const previousCount = chatItems.length;
      setChatItems(updatedChatItems);
      
      // If we have more items than before, show notification
      if (updatedChatItems.length > previousCount && previousCount > 0) {
        const newMessagesCount = updatedChatItems.length - previousCount;
        setNewMessageNotification({
          count: newMessagesCount,
          timestamp: new Date(),
          latestMessage: getLatestMessage(updatedChatItems)
        });
        
        // Auto-clear notification after 5 seconds
        setTimeout(() => {
          setNewMessageNotification(null);
        }, 5000);
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Helper function to get the latest message
  const getLatestMessage = (chatItems) => {
    if (!chatItems || chatItems.length === 0) return null;
    
    let latestMessage = null;
    let latestTimestamp = null;
    
    chatItems.forEach(item => {
      if (item.message && Array.isArray(item.message)) {
        item.message.forEach(msg => {
          const msgTimestamp = new Date(msg.date);
          if (!latestTimestamp || msgTimestamp > latestTimestamp) {
            latestTimestamp = msgTimestamp;
            latestMessage = {
              content: msg.content,
              author: item.nomPrenon || item.email || 'Unknown',
              timestamp: msg.date
            };
          }
        });
      }
    });
    
    return latestMessage;
  };

  // Function to manually clear notification
  const clearNotification = useCallback(() => {
    setNewMessageNotification(null);
  }, []);

  // Function to update chat items (for initial load)
  const updateChatItems = useCallback((items) => {
    setChatItems(items);
  }, []);

  const value = {
    socket,
    isConnected,
    chatItems,
    newMessageNotification,
    clearNotification,
    updateChatItems
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};