import React, { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, ChevronDown, X, Columns3Cog, Hash, User, MessageSquare, Calendar, Mail, Phone, CalendarDays, Maximize2 } from 'lucide-react';

function ChatLog({ chatItems }) {
  const { t, i18n } = useTranslation();
  
  const [showMessagesPerPageDropdown, setShowMessagesPerPageDropdown] = useState(false);
  const messagesPerPageDropdownRef = useRef(null);
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
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [datePreset, setDatePreset] = useState('');
  
  // Author search dropdown state
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const authorDropdownRef = useRef(null);
  const authorInputRef = useRef(null);
  const dateFilterRef = useRef(null);
  
  const [messagesPerPage, setMessagesPerPage] = useState(() => {
    return parseInt(localStorage.getItem('messagesPerPage')) || 5;
  });
  const tableContainerRef = useRef(null);

  // Date preset options
  const datePresets = [
    { key: 'today', label: t('Today'), days: 0 },
    { key: 'yesterday', label: t('Yesterday'), days: 1 },
    { key: 'last7days', label: t('Last 7 days'), days: 7 },
    { key: 'last30days', label: t('Last 30 days'), days: 30 },
    { key: 'last90days', label: t('Last 90 days'), days: 90 },
    { key: 'thisMonth', label: t('This month'), type: 'month' },
    { key: 'lastMonth', label: t('Last month'), type: 'lastMonth' },
    { key: 'thisYear', label: t('This year'), type: 'year' },
  ];
  const [expandedMessage, setExpandedMessage] = useState(null);
  const expandedMessageRef = useRef(null);
  // Helper function to get date range for presets
  const getDateRangeForPreset = (preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset.type) {
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        };
      case 'lastMonth':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        };
      default:
        if (preset.days === 0) {
          return {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          };
        } else if (preset.days === 1) {
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          return {
            start: yesterday,
            end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
          };
        } else {
          return {
            start: new Date(today.getTime() - preset.days * 24 * 60 * 60 * 1000),
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          };
        }
    }
  };

  // Handle date preset selection
  const handleDatePresetSelect = (preset) => {
    const { start, end } = getDateRangeForPreset(preset);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setDatePreset(preset.key);
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setDatePreset('');
  };

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

  // Filter messages based on search, author filter, and date range
  const filteredMessages = useMemo(() => {
    return flatMessages.filter(msg => {
      const matchesSearch = searchTerm === '' || 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAuthor = authorFilter === '' || msg.author === authorFilter;
      
      // Date filtering
      let matchesDate = true;
      if (startDate || endDate) {
        const messageDate = new Date(msg.timestamp);
        const startDateTime = startDate ? new Date(startDate + 'T00:00:00') : null;
        const endDateTime = endDate ? new Date(endDate + 'T23:59:59') : null;
        
        if (startDateTime && messageDate < startDateTime) {
          matchesDate = false;
        }
        if (endDateTime && messageDate > endDateTime) {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesAuthor && matchesDate;
    });
  }, [flatMessages, searchTerm, authorFilter, startDate, endDate]);

  
  const hasCustomDateRange = (startDate || endDate) && !datePreset;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
      // Add this new condition for expanded message
      if (expandedMessageRef.current && !expandedMessageRef.current.contains(event.target)) {
        setExpandedMessage(null);
      }
      if (messagesPerPageDropdownRef.current && !messagesPerPageDropdownRef.current.contains(event.target)) {
        setShowMessagesPerPageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExpandMessage = (messageId, content, author, timestamp) => {
    setExpandedMessage(expandedMessage === messageId ? null : { id: messageId, content, author, timestamp });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter, startDate, endDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('messagesPerPage', messagesPerPage.toString());
  }, [messagesPerPage]);

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

  // Check if date filters are active
  const hasDateFilters = startDate || endDate;

  const columns = [
    { key: 'lineNumber', label: t('Line_number'), width: 'w-30', icon: Hash },
    { key: 'author', label: t('Author'), width: 'w-38', icon: User },
    { key: 'content', label: t('Message'), width: 'flex-1', icon: MessageSquare },
    { key: 'timestamp', label: t('Date'), width: 'w-56', icon: Calendar },
    { key: 'email', label: t('Email'), width: 'w-56', icon: Mail },
    { key: 'telephone', label: t('Phone'), width: 'w-32', icon: Phone }
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
    <div className="m-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
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
                  autoComplete="off"
                  className="w-64 pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
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

            {/* Date Filter */}
            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
                  hasDateFilters
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                {hasDateFilters ? t('Date: {{count}} filter', { count: (startDate ? 1 : 0) + (endDate ? 1 : 0) }) : t('Date Filter')}
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showDateFilter && (
                <div className="absolute z-20 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80">
                  <div className="space-y-4">
                    {/* Date Range Inputs */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('Custom Date Range')}
                        </label>
                        {hasCustomDateRange && (
                          <button
                            onClick={() => {
                              setStartDate('');
                              setEndDate('');
                              setDatePreset('');
                            }}
                            className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yelow-800 dark:hover:text-yellow-200 px-2 cursor-pointer py-1 bg-yellow-50 dark:bg-yellow-900 rounded"
                          >
                            {t('Clear Range')}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('From')}
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              setDatePreset('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('To')}
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              setDatePreset('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Warning message when custom date range is set */}
                    
                    {/* Quick Presets */}
                    <div className={hasCustomDateRange ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Quick Presets')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {datePresets.map(preset => (
                          <button
                          key={preset.key}
                          onClick={() => handleDatePresetSelect(preset)}
                          disabled={hasCustomDateRange}
                          className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${
                            datePreset === preset.key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                          } ${hasCustomDateRange ? 'cursor-not-allowed' : ''}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={`transition-all duration-300 ease-out ${
                      hasCustomDateRange 
                        ? 'opacity-100 translate-y-0 max-h-20' 
                        : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden'
                    }`}>
                      <div className="p-1 bg-yellow-50 dark:bg-yellow-700 border border-yellow-300 dark:border-yellow-700 rounded-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-sm">
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-14 h-14 text-yellow-600 dark:text-yellow-400 animate-pulse" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            {t('Quick presets are disabled when using custom date range')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={clearDateFilters}
                        className="px-3 py-1 text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-500 rounded-lg hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {t('Clear All')}
                      </button>
                      <button
                        onClick={() => setShowDateFilter(false)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t('Apply')}
                      </button>
                    </div>
                  </div>
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
              <Columns3Cog className="w-4 h-4" />
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
        
        {/* Active Filters Display */}
        {(authorFilter || hasDateFilters || searchTerm) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                <Search className="w-3 h-3" />
                {t('Search: {{term}}', { term: searchTerm })}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {authorFilter && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                <User className="w-3 h-3" />
                {t('Author: {{author}}', { author: authorFilter })}
                <button
                  onClick={handleClearAuthorFilter}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {hasDateFilters && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                <CalendarDays className="w-3 h-3" />
                {startDate && endDate
                  ? t('Date: {{start}} - {{end}}', { start: startDate, end: endDate })
                  : startDate
                  ? t('From: {{date}}', { date: startDate })
                  : t('Until: {{date}}', { date: endDate })}
                <button
                  onClick={clearDateFilters}
                  className="ml-1 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Results info */}
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {t('Showing {{start}} - {{end}} of {{total}} messages', {
            start: Math.min(startIndex + 1, filteredMessages.length),
            end: Math.min(endIndex, filteredMessages.length),
            total: filteredMessages.length
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto h-[450px] overflow-y-auto" ref={tableContainerRef}>
        <table className="w-full">
          <thead className="bg-gray-200 dark:bg-gray-600 sticky top-0 z-10">
            <tr>
              {columns.map(column => (
                visibleColumns[column.key] && (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.width}`}
                  >
                    <div className="flex items-center gap-2">
                      <column.icon className="w-4 h-4" />
                      {column.label}
                    </div>
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
                  <td className="px-4 py-4 relative">
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line max-h-20 overflow-hidden">
                      {message.content}
                    </div>
                    {message.content.length > 100 && (
                      <button
                        onClick={() => handleExpandMessage(message.id || `${startIndex + idx}`, message.content, message.author, message.timestamp)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                        title={t('Expand message')}
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}
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
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">

          <div className='flex items-center'>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {t('Page {{current}} of {{total}}', { current: currentPage, total: totalPages })}
            </div>
            {/* Messages Per Page Dropdown */}
            <div className="ml-4 relative" ref={messagesPerPageDropdownRef}>
              <button
                onClick={() => setShowMessagesPerPageDropdown(!showMessagesPerPageDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 w-37.5"
              >
                <Hash className="w-4 h-4" />
                {t('{{count}} per page', { count: messagesPerPage })}
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showMessagesPerPageDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showMessagesPerPageDropdown && (
                <div 
                  className="absolute z-20 left-0 mt-1 border border-transparent rounded-lg p-0 w-37.5 transform transition-all duration-200 ease-out animate-in slide-in-from-top-2 fade-in"
                  style={{
                    animation: 'slideDown 0.2s ease-out forwards'
                  }}
                >
                  <div className="space-y-1">
                    {[3, 5, 8, 10].map((count, index) => (
                      <button
                        key={count}
                        onClick={() => {
                          setMessagesPerPage(count);
                          setShowMessagesPerPageDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-sm rounded-lg border text-left transition-all duration-150  ${
                          messagesPerPage === count
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                        style={{
                          animation: `slideDownStagger 0.3s ease-out forwards`,
                          animationDelay: `${index * 50}ms`,
                          opacity: 0,
                          transform: 'translateY(-10px)'
                        }}
                      >
                        {t('{{count}} per page', { count })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <style jsx>{`
                @keyframes slideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
                
                @keyframes slideDownStagger {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                @keyframes slideUp {
                  from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                  to {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                  }
                }
              `}</style>
            </div>
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
      {expandedMessage && (
        <>
          <style>
            {`
              @keyframes modalFadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              
              @keyframes modalScaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.9) translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              
              .modal-backdrop {
                animation: modalFadeIn 0.2s ease-out;
              }
              
              .modal-content {
                animation: modalScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
            `}
          </style>
          <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-[5px] flex items-center justify-center z-50 modal-backdrop">
            <div 
              ref={expandedMessageRef}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl max-h-[85vh] w-full mx-4 flex flex-col modal-content border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {expandedMessage.author}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatTimestamp(expandedMessage.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedMessage(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed text-[15px] font-normal">
                    {expandedMessage.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
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