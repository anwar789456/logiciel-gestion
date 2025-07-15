// src/hooks/useWebSocketStatus.js
import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

export const useWebSocketStatus = () => {
  const { socket, isConnected } = useWebSocket();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleConnecting = () => {
      setConnectionStatus('connecting');
    };

    const handleConnect = () => {
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleReconnectAttempt = (attempt) => {
      setConnectionStatus('reconnecting');
      setReconnectAttempts(attempt);
    };

    const handleReconnectError = () => {
      setConnectionStatus('reconnect_error');
    };

    const handleReconnectFailed = () => {
      setConnectionStatus('reconnect_failed');
    };

    socket.on('connecting', handleConnecting);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    return () => {
      socket.off('connecting', handleConnecting);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
    };
  }, [socket]);

  return {
    connectionStatus,
    isConnected,
    reconnectAttempts,
    socket
  };
};