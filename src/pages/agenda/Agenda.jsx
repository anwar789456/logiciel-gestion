import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Plus, Trash2, Edit, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllAgendaEvents, addAgendaEvent, updateAgendaEvent, deleteAgendaEvent } from '../../api/Agenda/Agenda'

// Helper function to format dates in Tunisia/Ariana timezone (UTC+1)
const formatDateToArianaTimezone = (date) => {
  if (!date) return ''
  const dateObj = new Date(date)
  
  // Get the date in YYYY-MM-DD format without timezone conversion
  // This prevents the extra day/hour issue
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export default function Agenda() {
  const { t } = useTranslation()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Initialize dates with current date (no timezone conversion)
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    event: '',
    date_event_start: formatDateToArianaTimezone(new Date()),
    date_event_end: formatDateToArianaTimezone(new Date())
  })

  const months = [
    t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
    t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
  ]

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Update calendar when month or year changes
  useEffect(() => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1))
  }, [selectedMonth, selectedYear])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await getAllAgendaEvents()
      
      // Convert all dates to Ariana timezone format
      const eventsWithArianaTimezone = data.map(event => ({
        ...event,
        date_event_start: formatDateToArianaTimezone(event.date_event_start),
        date_event_end: formatDateToArianaTimezone(event.date_event_end)
      }))
      
      setEvents(eventsWithArianaTimezone)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError(t('failed_to_load_events'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async () => {
    try {
      // Ensure dates are in Ariana timezone format
      const eventData = {
        ...newEvent,
        date_event_start: formatDateToArianaTimezone(newEvent.date_event_start),
        date_event_end: formatDateToArianaTimezone(newEvent.date_event_end)
      }
      await addAgendaEvent(eventData)
      setShowAddModal(false)
      setNewEvent({
        event: '',
        date_event_start: formatDateToArianaTimezone(new Date()),
        date_event_end: formatDateToArianaTimezone(new Date())
      })
      fetchEvents()
    } catch (err) {
      console.error('Failed to add event:', err)
      setError(t('failed_to_add_event'))
    }
  }

  const handleUpdateEvent = async () => {
    try {
      // Ensure dates are in Ariana timezone format
      const eventData = {
        ...selectedEvent,
        date_event_start: formatDateToArianaTimezone(selectedEvent.date_event_start),
        date_event_end: formatDateToArianaTimezone(selectedEvent.date_event_end)
      }
      await updateAgendaEvent(selectedEvent._id, eventData)
      setShowEditModal(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Failed to update event:', err)
      setError(t('failed_to_update_event'))
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm(t('confirm_delete_event'))) {
      try {
        console.log('Deleting event with ID:', eventId)
        await deleteAgendaEvent(eventId)
        setShowEditModal(false)
        setSelectedEvent(null)
        fetchEvents()
      } catch (err) {
        console.error('Failed to delete event:', err)
        setError(t('failed_to_delete_event'))
      }
    }
  }

  const getDaysInMonth = (year, month) => {
    // Get days in month without timezone conversion
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    // Get first day of month without timezone conversion
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    // Create a date in Ariana timezone for the previous month
    let newMonth = selectedMonth - 1
    let newYear = selectedYear
    
    if (newMonth < 0) {
      newMonth = 11
      newYear = newYear - 1
    }
    
    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  const handleNextMonth = () => {
    // Create a date in Ariana timezone for the next month
    let newMonth = selectedMonth + 1
    let newYear = selectedYear
    
    if (newMonth > 11) {
      newMonth = 0
      newYear = newYear + 1
    }
    
    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  const selectMonth = (monthIndex) => {
    setSelectedMonth(monthIndex)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []

    // Get today's date for highlighting current day
    const today = new Date()
    const todayString = formatDateToArianaTimezone(today)

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date without timezone conversion
      const date = new Date(selectedYear, selectedMonth, day)
      const dateString = formatDateToArianaTimezone(date)
      
      // Find events for this day
      const dayEvents = events.filter(event => {
        const startDate = formatDateToArianaTimezone(event.date_event_start)
        const endDate = formatDateToArianaTimezone(event.date_event_end)
        return dateString >= startDate && dateString <= endDate
      })

      days.push(
        <div key={day} className="h-24 border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${todayString === dateString ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
              {day}
            </span>
          </div>
          <div className="overflow-y-auto max-h-16">
            {dayEvents.map((event, index) => (
              <div 
                key={index} 
                className="text-xs p-1 mb-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 cursor-pointer truncate"
                onClick={() => {
                  setSelectedEvent(event)
                  setShowEditModal(true)
                }}
              >
                {event.event}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className='pt-4 px-8 pb-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className='text-2xl font-semibold text-gray-800 dark:text-white'>Agenda</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {t('add_event')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Month selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {months.map((month, index) => (
          <button
            key={index}
            onClick={() => selectMonth(index)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMonth === index ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">
            {months[selectedMonth]} {selectedYear}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              // Use current date without timezone conversion
              const today = new Date()
              setSelectedMonth(today.getMonth())
              setSelectedYear(today.getFullYear())
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {t('Today')}
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          {[t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')].map((day, index) => (
            <div key={index} className="py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {loading ? (
            <div className="col-span-7 p-4 text-center text-gray-500 dark:text-gray-400">
              {t('loading_calendar')}
            </div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-transparent backdrop:blur-2xl bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('add_event')}
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAddModal(false)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('event_title')}
                </label>
                <input
                  type="text"
                  value={newEvent.event}
                  onChange={(e) => setNewEvent({...newEvent, event: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('enter_event_title')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('start_date')}
                </label>
                <input
                  type="date"
                  value={newEvent.date_event_start}
                  onChange={(e) => setNewEvent({...newEvent, date_event_start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('end_date')}
                </label>
                <input
                  type="date"
                  value={newEvent.date_event_end}
                  onChange={(e) => setNewEvent({...newEvent, date_event_end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAddModal(false)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddEvent()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!newEvent.event || !newEvent.date_event_start || !newEvent.date_event_end}
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={(e) => {
            e.preventDefault()
            setShowEditModal(false)
            setSelectedEvent(null)
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('edit_event')}
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditModal(false)
                  setSelectedEvent(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('event_title')}
                </label>
                <input
                  type="text"
                  value={selectedEvent.event}
                  onChange={(e) => setSelectedEvent({...selectedEvent, event: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('enter_event_title')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('start_date')}
                </label>
                <input
                  type="date"
                  value={selectedEvent.date_event_start}
                  onChange={(e) => setSelectedEvent({...selectedEvent, date_event_start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('end_date')}
                </label>
                <input
                  type="date"
                  value={selectedEvent.date_event_end}
                  onChange={(e) => setSelectedEvent({...selectedEvent, date_event_end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Delete button clicked, event ID:', selectedEvent._id)
                    if (selectedEvent && selectedEvent._id) {
                      handleDeleteEvent(selectedEvent._id)
                    } else {
                      console.error('No event ID found for deletion')
                      setError(t('failed_to_delete_event'))
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  {t('delete')}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEditModal(false)
                      setSelectedEvent(null)
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateEvent()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!selectedEvent.event || !selectedEvent.date_event_start || !selectedEvent.date_event_end}
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
