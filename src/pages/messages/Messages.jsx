import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';
import ChatLog from '../../components/common/ChatLog';
import { FetchAllChatItems } from '../../api/messagerie';
import { useWebSocket } from '../../context/WebSocketContext';

function Messages() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const { chatItems, isConnected, updateChatItems } = useWebSocket();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await FetchAllChatItems();
        updateChatItems(data); // Update WebSocket context with initial data
      } catch (err) {
        setError(t('Failed to load messages.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t, updateChatItems]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 min-h-[300px]">
      {/* Connection Status Indicator */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {t('Live updates enabled')}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {t('Reconnecting...')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('Loading...')}
        </div>
      )}
      {error && (
        <div className="p-4 text-center text-red-500 dark:text-red-400">{error}</div>
      )}
      {!loading && !error && <ChatLog chatItems={chatItems} />}
    </div>
  );
}

export default Messages;