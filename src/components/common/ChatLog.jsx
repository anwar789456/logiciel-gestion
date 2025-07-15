import React, { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Search, Settings, ChevronLeft, ChevronRight, Eye, EyeOff, ChevronDown, X } from 'lucide-react';

function ChatLog({ chatItems }) {
  const { t, i18n } = useTranslation();
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    lineNumber: true,
    author: true,
    content: true,
    timestamp: true,
    email: true,
    telephone: true
  });
  
  // Author search dropdown state
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const authorDropdownRef = useRef(null);
  const authorInputRef = useRef(null);
  
  // Dynamic pagination state
  const [messagesPerPage, setMessagesPerPage] = useState(4);
  const tableContainerRef = useRef(null);

  // Flatten messages to a single array with sender info
  const flatMessages = useMemo(() => {
    return (chatItems || []).flatMap((item) => {
      if (!Array.isArray(item.message)) return [];
      return item.message.map((msg) => ({
        author: item.nomPrenon || item.email || t('Unknown'),
        content: msg.content,
        timestamp: msg.date,
        id: msg._id,
        email: item.email,
        telephone: item.telephone
      }));
    });
  }, [chatItems, t]);

  // Get unique authors for filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = [...new Set(flatMessages.map(msg => msg.author))];
    return authors.sort();
  }, [flatMessages]);

  // Filter authors based on search term
  const filteredAuthors = useMemo(() => {
    if (!authorSearchTerm) return uniqueAuthors;
    return uniqueAuthors.filter(author =>
      author.toLowerCase().includes(authorSearchTerm.toLowerCase())
    );
  }, [uniqueAuthors, authorSearchTerm]);

  // Filter messages based on search and author filter
  const filteredMessages = useMemo(() => {
    return flatMessages.filter(msg => {
      const matchesSearch = searchTerm === '' || 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAuthor = authorFilter === '' || msg.author === authorFilter;
      
      return matchesSearch && matchesAuthor;
    });
  }, [flatMessages, searchTerm, authorFilter]);

  // Calculate dynamic messages per page based on visible columns
  const calculateMessagesPerPage = () => {
    // Base height estimates for different column combinations
    const baseRowHeight = 64; // px - base row height
    const contentColumnHeight = 100; // additional height when content is visible
    const containerHeight = 540; // fixed container height
    const headerHeight = 48; // table header height
    const availableHeight = containerHeight - headerHeight;
    
    // Estimate row height based on visible columns
    let estimatedRowHeight = baseRowHeight;
    if (visibleColumns.content) {
      estimatedRowHeight += contentColumnHeight;
    }
    
    // Calculate how many messages can fit
    const calculatedMessages = Math.floor(availableHeight / estimatedRowHeight);
    
    // Ensure at least 1 message per page and reasonable limits
    return Math.max(1, Math.min(calculatedMessages, 50));
  };

  // Update messages per page when visible columns change
  useEffect(() => {
    const newMessagesPerPage = calculateMessagesPerPage();
    setMessagesPerPage(newMessagesPerPage);
    
    // Reset to first page when column visibility changes
    setCurrentPage(1);
  }, [visibleColumns]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleAuthorSelect = (author) => {
    setAuthorFilter(author);
    setAuthorSearchTerm('');
    setShowAuthorDropdown(false);
  };

  const handleClearAuthorFilter = () => {
    setAuthorFilter('');
    setAuthorSearchTerm('');
    setShowAuthorDropdown(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString(i18n.language);
  };

  const columns = [
    { key: 'lineNumber', label: t('Line_number'), width: 'w-30' },
    { key: 'author', label: t('Author'), width: 'w-38' },
    { key: 'content', label: t('Message'), width: 'flex-1' },
    { key: 'timestamp', label: t('Date'), width: 'w-56' },
    { key: 'email', label: t('Email'), width: 'w-56' },
    { key: 'telephone', label: t('Phone'), width: 'w-32' }
  ];

  if (!flatMessages.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 p-8 text-center">
        <div className="text-lg font-medium mb-2">{t('No messages to display')}</div>
        <div className="text-sm">{t('Messages will appear here when available')}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 m-8">
      {/* Header with filters and controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('Search messages...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            {/* Author Filter - Searchable Dropdown */}
            <div className="relative" ref={authorDropdownRef}>
              <div className="relative">
                <input
                  ref={authorInputRef}
                  type="text"
                  placeholder={authorFilter || t('Search authors...')}
                  value={authorSearchTerm}
                  onChange={(e) => setAuthorSearchTerm(e.target.value)}
                  onFocus={() => setShowAuthorDropdown(true)}
                  className="w-48 pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                
                {/* Clear button */}
                {authorFilter && (
                  <button
                    onClick={handleClearAuthorFilter}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Dropdown toggle */}
                <button
                  onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${showAuthorDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Dropdown menu */}
              {showAuthorDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* All Authors option */}
                  <button
                    onClick={() => handleAuthorSelect('')}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                      !authorFilter ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {t('All Authors')}
                  </button>
                  
                  {/* Filtered authors */}
                  {filteredAuthors.map(author => (
                    <button
                      key={author}
                      onClick={() => handleAuthorSelect(author)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        authorFilter === author ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {author}
                    </button>
                  ))}
                  
                  {/* No results message */}
                  {filteredAuthors.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('No authors found')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Column Settings */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <Settings className="w-4 h-4" />
              {t('Columns')}
            </button>
            
            {showColumnSettings && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-11 p-3 min-w-48">
                {columns.map(column => (
                  <label key={column.key} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() => handleColumnToggle(column.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {visibleColumns[column.key] ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Results info */}
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {t('Showing {{start}} - {{end}} of {{total}} messages', {
            start: Math.min(startIndex + 1, filteredMessages.length),
            end: Math.min(endIndex, filteredMessages.length),
            total: filteredMessages.length
          })} • {messagesPerPage} per page
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto h-[540px] overflow-y-auto" ref={tableContainerRef}>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {columns.map(column => (
                visibleColumns[column.key] && (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.width}`}
                  >
                    {column.label}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentMessages.map((message, idx) => (
              <tr key={message.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {visibleColumns.lineNumber && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      {startIndex + idx + 1}
                    </div>
                  </td>
                )}
                {visibleColumns.author && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message.author}
                    </div>
                  </td>
                )}
                {visibleColumns.content && (
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line  max-h-42 overflow-y-auto">
                      {message.content}
                    </div>
                  </td>
                )}
                {visibleColumns.timestamp && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </td>
                )}
                {visibleColumns.email && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {message.email || '-'}
                    </div>
                  </td>
                )}
                {visibleColumns.telephone && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {message.telephone || '-'}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {t('Page {{current}} of {{total}}', { current: currentPage, total: totalPages })}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('Previous')}
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
              >
                {t('Next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ChatLog.propTypes = {
  chatItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nomPrenon: PropTypes.string,
      email: PropTypes.string,
      telephone: PropTypes.string,
      message: PropTypes.arrayOf(
        PropTypes.shape({
          content: PropTypes.string,
          date: PropTypes.string,
          _id: PropTypes.string,
        })
      ),
    })
  ),
};

export default ChatLog;