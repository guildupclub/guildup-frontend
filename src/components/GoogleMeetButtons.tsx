import React, { useState } from 'react';
import { useGoogleMeet } from '../contexts/GoogleMeetContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Calendar, Video, Clock } from 'lucide-react';

interface GoogleMeetButtonsProps {
  receiverEmail: string;
  receiverName: string;
}

export const GoogleMeetButtons: React.FC<GoogleMeetButtonsProps> = ({
  receiverEmail,
  receiverName,
}) => {
  const { createMeeting, scheduleMeeting, isCreatingMeeting, isSchedulingMeeting } = useGoogleMeet();
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');

  const handleInstantMeeting = async () => {
    try {
      await createMeeting(receiverEmail, receiverName);
    } catch (error) {
      console.error('Failed to create instant meeting:', error);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time for the meeting');
      return;
    }

    try {
      const dateTimeString = `${scheduledDate}T${scheduledTime}`;
      const scheduledDateTime = new Date(dateTimeString);
      
      if (scheduledDateTime <= new Date()) {
        toast.error('Please select a future date and time');
        return;
      }

      await scheduleMeeting(receiverEmail, receiverName, scheduledDateTime, meetingTitle);
      
      setScheduledDate('');
      setScheduledTime('');
      setMeetingTitle('');
      setShowScheduler(false);
      
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleInstantMeeting}
        disabled={isCreatingMeeting || isSchedulingMeeting}
        className="flex items-center gap-2"
        variant="default"
      >
        <Video className="h-4 w-4" />
        {isCreatingMeeting ? 'Creating Meeting...' : 'Start Video Call Now'}
      </Button>

      <Button
        onClick={() => setShowScheduler(!showScheduler)}
        disabled={isCreatingMeeting || isSchedulingMeeting}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Calendar className="h-4 w-4" />
        Schedule Meeting
      </Button>

      {showScheduler && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
          <h4 className="font-medium text-sm">Schedule Meeting with {receiverName}</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meeting Title (Optional)
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder={`Meeting with ${receiverName}`}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          image.png          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleScheduleMeeting}
              disabled={isSchedulingMeeting || !scheduledDate || !scheduledTime}
              className="flex items-center gap-2 flex-1"
              size="sm"
            >
              <Clock className="h-3 w-3" />
              {isSchedulingMeeting ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
            
            <Button
              onClick={() => setShowScheduler(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMeetButtons; 