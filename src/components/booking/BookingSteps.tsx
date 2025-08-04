"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CreditCard, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface TimeSlot {
  start: string;
  end: string;
  available?: boolean;
}

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

// Date Selection Step
export function DateSelectionStep({ offering, selectedDate, onDateSelect }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState<string | null>(selectedDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setSelectedDateState(dateString);
      onDateSelect(dateString);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1">
        {['F', 'S', 'S', 'M', 'T', 'W', 'T'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onClick={() => handleDateSelect(day)}
                disabled={!isDateSelectable(day)}
                className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedDateState === `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                    ? 'bg-primary text-white shadow-md'
                    : isDateSelectable(day)
                    ? 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {day.getDate()}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Time Selection Step
export function TimeSelectionStep({ offering, selectedDate, selectedTime, onTimeSelect, onBack }: any) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/slots', {
        params: {
          offering_id: offering._id,
          date: selectedDate
        }
      });

      if (response.data && Array.isArray(response.data)) {
        const slotsWithAvailability = response.data.map(slot => ({
          ...slot,
          available: true
        }));
        setTimeSlots(slotsWithAvailability);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(false);
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

  const groupTimeSlots = () => {
    const morning = timeSlots.filter(slot => {
      const hour = new Date(slot.start).getHours();
      return hour >= 8 && hour < 12;
    });
    const noon = timeSlots.filter(slot => {
      const hour = new Date(slot.start).getHours();
      return hour >= 12 && hour < 16;
    });
    const evening = timeSlots.filter(slot => {
      const hour = new Date(slot.start).getHours();
      return hour >= 16 && hour < 20;
    });
    return { morning, noon, evening };
  };

  const { morning, noon, evening } = groupTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-600">Selected Date</p>
          <p className="font-medium">{formatDateForDisplay(selectedDate)}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading available slots...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Morning Slots */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Morning (08:00 AM - 12:00 PM)</h4>
            <div className="grid grid-cols-2 gap-2">
              {morning.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => onTimeSelect(slot.start)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedTime === slot.start
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          </div>

          {/* Noon Slots */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Noon (12:00 PM - 04:00 PM)</h4>
            <div className="grid grid-cols-2 gap-2">
              {noon.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => onTimeSelect(slot.start)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedTime === slot.start
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          </div>

          {/* Evening Slots */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Evening (04:00 PM - 08:00 PM)</h4>
            {evening.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {evening.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => onTimeSelect(slot.start)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedTime === slot.start
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-red-500 text-sm">No available slots</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// User Details Step
export function UserDetailsStep({ onComplete, onBack }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ userDetails: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}

// Coupon Step
export function CouponStep({ offering, currentAmount, userId, authToken, onComplete, onBack }: any) {
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      onComplete({ couponCode: null, discountAmount: 0, finalAmount: currentAmount });
      return;
    }

    setApplying(true);
    try {
      const response = await axios.post('/api/coupons/apply', {
        code: couponCode,
        userId,
        cartTotal: currentAmount,
        offeringId: offering._id
      });

      if (response.data.valid) {
        const discountAmount = response.data.discountAmount || 0;
        const finalAmount = currentAmount - discountAmount;
        onComplete({ 
          couponCode: couponCode.toUpperCase(), 
          discountAmount, 
          finalAmount 
        });
      } else {
        alert(response.data.message || 'Invalid coupon code');
      }
    } catch (err) {
      alert('Failed to apply coupon. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSkip = () => {
    onComplete({ couponCode: null, discountAmount: 0, finalAmount: currentAmount });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code (Optional)
          </label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter coupon code"
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={handleApplyCoupon} 
            disabled={applying || !couponCode.trim()}
            className="flex-1"
          >
            {applying ? 'Applying...' : 'Apply Coupon'}
          </Button>
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

// Payment Step
export function PaymentStep({ offering, bookingData, onComplete, onBack }: any) {
  const [processing, setProcessing] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete({ success: true, bookingId: 'booking_123' });
    } catch (err) {
      onComplete({ success: false, error: 'Payment failed' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service:</span>
              <span>{offering.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{offering.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDateForDisplay(bookingData.selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date(bookingData.selectedTime).toLocaleTimeString()}</span>
            </div>
            {bookingData.couponCode && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Applied:</span>
                <span>{bookingData.couponCode}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>{formatPrice(bookingData.finalAmount)}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={processing}
          className="w-full"
        >
          {processing ? 'Processing Payment...' : `Pay ${formatPrice(bookingData.finalAmount)}`}
        </Button>
      </div>
    </div>
  );
} 