import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoIcon, Calendar, Clock, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleMeet } from '@/contexts/GoogleMeetContext';
import { toast } from 'sonner';

interface GoogleMeetButtonProps {
  receiverEmail: string;
  receiverName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

// Modern Date Picker Component
const ModernDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  id: string;
}> = ({ value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  const [calendarPosition, setCalendarPosition] = useState<'left' | 'right'>('left');
  
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  const minDate = new Date();

  // Calculate optimal position when opening
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const calendarWidth = 280; // Reduced from 320 to 280
      
      // For larger screens (web view), default to right alignment
      if (viewportWidth >= 768) {
        const spaceOnRight = viewportWidth - buttonRect.right;
        if (spaceOnRight >= calendarWidth) {
          setCalendarPosition('right'); // Align to right edge of button
        } else {
          setCalendarPosition('left'); // Fallback to left if not enough space
        }
      } else {
        // For smaller screens, use original logic
        const spaceOnRight = viewportWidth - buttonRect.right;
        const spaceOnLeft = buttonRect.left;
        
        if (spaceOnRight >= calendarWidth) {
          setCalendarPosition('left'); // Align to left edge of button
        } else if (spaceOnLeft >= calendarWidth) {
          setCalendarPosition('right'); // Align to right edge of button
        } else {
          // Not enough space on either side, use left but constrain width
          setCalendarPosition('left');
        }
      }
    }
  }, [isOpen]);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && 
           date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  const isDateToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative">
      {/* Date Input Display */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-left flex items-center justify-between hover:border-gray-300"
      >
        <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
          {selectedDate ? formatDisplayDate(selectedDate) : 'Select date'}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          <div 
            ref={calendarRef}
            className={`absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-72 p-3 max-w-[calc(100vw-1rem)] ${
              calendarPosition === 'left' ? 'left-0' : 'right-0'
            }`}
            style={{
              // Ensure it doesn't go off screen
              ...(calendarPosition === 'right' && { right: 0, left: 'auto' }),
              ...(calendarPosition === 'left' && { left: 0, right: 'auto' })
            }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <h3 className="text-base font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((date, index) => {
                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);
                const isToday = isDateToday(date);
                const inCurrentMonth = isDateInCurrentMonth(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !disabled && selectDate(date)}
                    disabled={disabled}
                    className={`
                      w-8 h-8 text-sm rounded-lg transition-all relative
                      ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                      ${!inCurrentMonth ? 'text-gray-300' : ''}
                      ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      ${isToday && !selected ? 'bg-blue-100 text-blue-600 font-medium' : ''}
                      ${inCurrentMonth && !selected && !isToday ? 'text-gray-900' : ''}
                    `}
                  >
                    {date.getDate()}
                    {isToday && !selected && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  selectDate(today);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

// Modern Time Picker Component
const ModernTimePicker: React.FC<{
  value: string;
  onChange: (time: string) => void;
  id: string;
}> = ({ value, onChange, id }) => {
  const [hour, setHour] = useState(() => {
    if (!value) return '12';
    const [h] = value.split(':');
    const hour12 = parseInt(h) === 0 ? 12 : parseInt(h) > 12 ? parseInt(h) - 12 : parseInt(h);
    return hour12.toString();
  });
  
  const [minute, setMinute] = useState(() => {
    if (!value) return '00';
    const [, m] = value.split(':');
    return m || '00';
  });
  
  const [period, setPeriod] = useState(() => {
    if (!value) return 'PM';
    const [h] = value.split(':');
    return parseInt(h) >= 12 ? 'PM' : 'AM';
  });

  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    let hour24 = parseInt(newHour);
    if (newPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    if (newPeriod === 'AM' && hour24 === 12) hour24 = 0;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    onChange(timeString);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className="flex gap-2 items-center">
      {/* Hour Selector */}
      <div className="flex-1">
        <select
          id={id}
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>

      <span className="text-gray-400 font-medium">:</span>

      {/* Minute Selector */}
      <div className="flex-1">
        <select
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handlePeriodChange('AM')}
          className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
            period === 'AM' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => handlePeriodChange('PM')}
          className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
            period === 'PM' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
};

export const GoogleMeetButton: React.FC<GoogleMeetButtonProps> = ({
  receiverEmail,
  receiverName,
  size = 'md',
  variant = 'outline',
  showText = false
}) => {
  const { createMeeting, scheduleMeeting, isCreatingMeeting, isSchedulingMeeting } = useGoogleMeet();
  const [showOptions, setShowOptions] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');

  const handleCreateMeeting = async () => {
    try {
      console.log('🚀 Starting Google Meet creation for:', receiverName);
      
      const meetingUrl = await createMeeting(receiverEmail, receiverName);
      
      console.log('🎯 Meeting created and shared:', meetingUrl);
      setShowOptions(false);
      
    } catch (error: any) {
      console.error('❌ Error creating Google Meet:', error);
      toast.error('Failed to create Google Meet. Please try again.');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time for the meeting');
      return;
    }

    try {
      // Combine date and time
      const dateTimeString = `${scheduledDate}T${scheduledTime}`;
      const scheduledDateTime = new Date(dateTimeString);
      
      // Check if the date is in the future
      if (scheduledDateTime <= new Date()) {
        toast.error('Please select a future date and time');
        return;
      }

      // Create .ics file content - Google Calendar will generate the Meet link automatically
      const startTime = scheduledDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endTime = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `guild-meeting-${Date.now()}@guildup.club`;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Guild//Meeting Scheduler//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${meetingTitle || `Meeting with ${receiverName}`}`,
        `DESCRIPTION:Google Meet video call scheduled via Guild.\\n\\nMeeting Details:\\n- Participants: You and ${receiverName} (${receiverEmail})\\n- Google Meet link will be automatically generated when you save this event\\n- Support: support@guildup.club\\n\\nThis meeting was scheduled through Guild's integrated scheduling system.`,
        'LOCATION:Google Meet (link will be added automatically)',
        `ORGANIZER:CN=Guild Support:MAILTO:support@guildup.club`,
        `ATTENDEE;CN=${receiverName};RSVP=TRUE:MAILTO:${receiverEmail}`,
        'ATTENDEE;CN=Guild Support;RSVP=FALSE:MAILTO:support@guildup.club',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      // Create and download .ics file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meeting-${receiverName.replace(/\s+/g, '-').toLowerCase()}-${scheduledDate}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Also provide Google Calendar option as backup
      const calendarUrl = new URL('https://calendar.google.com/calendar/render');
      const guestList = [receiverEmail, 'support@guildup.club'].join(',');
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: meetingTitle || `Meeting with ${receiverName}`,
        dates: `${startTime}/${endTime}`,
        details: `Google Meet video call scheduled via Guild.\n\nMeeting Details:\n- Participants: You and ${receiverName} (${receiverEmail})\n- Google Meet link will be automatically generated when you save this event\n- Support: support@guildup.club\n\nThis meeting was scheduled through Guild's integrated scheduling system.`,
        location: 'Google Meet (link will be added automatically)',
        add: guestList
      });
      calendarUrl.search = params.toString();

      // Call the original scheduling function to send chat message
      await scheduleMeeting(receiverEmail, receiverName, scheduledDateTime, meetingTitle || `Meeting with ${receiverName}`);
      
      // Show success message with options
      toast.success(
        <div>
          <div className="font-medium">Meeting scheduled!</div>
          <div className="text-sm mt-1">Calendar file downloaded with meeting details.</div>
          <button 
            onClick={() => window.open(calendarUrl.toString(), '_blank')}
            className="text-blue-600 hover:text-blue-700 text-sm underline mt-2 block"
          >
            Open Google Calendar
          </button>
        </div>,
        { duration: 8000 }
      );
      
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setMeetingTitle('');
      setShowScheduler(false);
      setShowOptions(false);
      
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast.error('Failed to create calendar event. Please try again.');
    }
  };

  const sizeClasses = {
    sm: showText ? 'h-8 px-3 text-sm' : 'w-8 h-8 p-0',
    md: showText ? 'h-10 px-4' : 'w-10 h-10 p-0',
    lg: showText ? 'h-12 px-6' : 'w-12 h-12 p-0'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <>
      <div className="relative">
        {/* Main Button */}
        <div className="flex">
          <Button
            onClick={handleCreateMeeting}
            variant={variant}
            size="sm"
            className={`${sizeClasses[size]} ${showText ? 'rounded-r-none' : 'rounded-full'} bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700`}
            disabled={isCreatingMeeting || isSchedulingMeeting}
            title={`Start Google Meet with ${receiverName} (both join same room)`}
          >
            {isCreatingMeeting ? (
              <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4"></div>
            ) : (
              <>
                <VideoIcon className={`${iconSizes[size]} ${showText ? 'mr-2' : ''}`} />
                {showText && 'Google Meet'}
              </>
            )}
          </Button>
          
          {/* Dropdown Button */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isCreatingMeeting || isSchedulingMeeting}
            className="ml-1 p-1 hover:bg-gray-100 rounded-sm transition-colors disabled:opacity-50"
            title="More meeting options"
          >
            <ChevronDown className={`w-3 h-3 text-gray-500 hover:text-gray-700 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showOptions && (
          <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 w-56 py-1">
            <button
              onClick={handleCreateMeeting}
              disabled={isCreatingMeeting}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Start Meeting Now</div>
                <div className="text-xs text-gray-500">Begin video call immediately</div>
              </div>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                setShowScheduler(true);
                setShowOptions(false);
              }}
              disabled={isSchedulingMeeting}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Schedule Meeting</div>
                <div className="text-xs text-gray-500">Plan for later with calendar invite</div>
              </div>
            </button>
          </div>
        )}
        
        {/* Click outside to close */}
        {showOptions && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)}
          />
        )}
      </div>

      {/* Schedule Meeting Dialog */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Meeting</h3>
                  <p className="text-sm text-gray-500">with {receiverName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduler(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Meeting Title */}
              <div className="space-y-2">
                <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700">
                  Meeting Title
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder={`Meeting with ${receiverName}`}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500">Optional - leave blank for default title</p>
              </div>

              {/* Date and Time Grid */}
              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <ModernDatePicker
                    id="meeting-date"
                    value={scheduledDate}
                    onChange={setScheduledDate}
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label htmlFor="meeting-time" className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <ModernTimePicker
                    id="meeting-time"
                    value={scheduledTime}
                    onChange={setScheduledTime}
                  />
                </div>
              </div>

              {/* Preview */}
              {scheduledDate && scheduledTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Meeting scheduled for:</strong><br />
                    {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <Button
                onClick={() => setShowScheduler(false)}
                variant="outline"
                className="flex-1"
                disabled={isSchedulingMeeting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleMeeting}
                disabled={isSchedulingMeeting || !scheduledDate || !scheduledTime}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSchedulingMeeting ? (
                  <>
                    <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4 mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};