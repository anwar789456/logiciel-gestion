import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageSquare } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

const NewMessageNotification = () => {
  const { t } = useTranslation();
  const { newMessageNotification, clearNotification } = useWebSocket();

  if (!newMessageNotification) return null;

  const { count, latestMessage } = newMessageNotification;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80 max-w-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {count === 1 ? t('New Message') : t('New Messages')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {count === 1 
                  ? t('You have a new message') 
                  : t('You have {{count}} new messages', { count })
                }
              </p>
            </div>
          </div>
          <button
            onClick={clearNotification}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {latestMessage && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {latestMessage.author}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {latestMessage.content}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(latestMessage.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMessageNotification;