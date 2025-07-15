import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatLog from '../../components/common/ChatLog';
import { FetchAllChatItems } from '../../api/messagerie';

function Messages() {
  const { t } = useTranslation();
  const [chatItems, setChatItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await FetchAllChatItems();
        setChatItems(data);
      } catch (err) {
        setError(t('Failed to load messages.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 min-h-[300px]">
      {loading && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('Loading...')}</div>
      )}
      {error && (
        <div className="p-4 text-center text-red-500 dark:text-red-400">{error}</div>
      )}
      {!loading && !error && <ChatLog chatItems={chatItems} />}
    </div>
  );
}

export default Messages;