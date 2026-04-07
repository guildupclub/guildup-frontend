"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface Offering {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price?: number;
  duration: number;
  type: string;
  community_id: string;
  provider_id: string;
}

interface TimeSlot {
  start: string;
  end: string;
  available?: boolean;
}

interface TimeSlotSelectionProps {
  offering: Offering;
  selectedDate: string;
  onComplete: (data: { selectedTime: string }) => void;
  onBack: () => void;
}

export default function TimeSlotSelection({ 
  offering, 
  selectedDate, 
  onComplete, 
  onBack 
}: TimeSlotSelectionProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate, offering._id]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/slots', {
        params: {
          offering_id: offering._id,
          date: selectedDate
        }
      });

      if (response.data && Array.isArray(response.data)) {
        // Backend returns slots with only start and end properties
        // All returned slots are available (free)
        const slotsWithAvailability = response.data.map(slot => ({
          ...slot,
          available: true
        }));
        setTimeSlots(slotsWithAvailability);
      } else {
        setTimeSlots([]);
      }
    } catch (err: any) {
      console.error('Error fetching time slots:', err);
      setError(err.response?.data?.error || 'Failed to fetch available time slots');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available !== false) {
      setSelectedTime(timeSlot.start);
    }
  };

  const handleContinue = () => {
    if (selectedTime) {
      onComplete({ selectedTime });
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const availableSlots = timeSlots.filter(slot => slot.available !== false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Preferred Time</h3>
        <p className="text-sm text-gray-600">Choose a time slot for your session on {formatDate(selectedDate)}</p>
      </div>

      {/* Selected Date Display */}
      <Card className="bg-primary/10 border border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Selected Date</p>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offering Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{offering.title}</h4>
              <p className="text-sm text-gray-600">{offering.duration} minutes</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {formatPrice(offering.discounted_price || offering.price.amount)}
              </div>
              {offering.discounted_price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(offering.price.amount)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading available slots...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAvailableSlots} variant="outline">
                Try Again
              </Button>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No available slots for this date</p>
              <p className="text-sm text-gray-500">Please select a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.map((slot, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTimeSelect(slot)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTime === slot.start
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg">
                      {formatTime(slot.start)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(slot.end)}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Time Display */}
      {selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Selected Time</p>
              <p className="text-sm text-gray-600">
                {formatTime(selectedTime)} - {formatTime(new Date(new Date(selectedTime).getTime() + offering.duration * 60000))}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedTime || loading}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 