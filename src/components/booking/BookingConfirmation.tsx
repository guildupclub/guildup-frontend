"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface BookingData {
  selectedDate: string;
  selectedTime: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  couponCode: string | null;
  discountAmount: number;
  finalAmount: number;
}

interface BookingConfirmationProps {
  bookingData: BookingData;
  onClose: () => void;
  success?: boolean;
  bookingId?: string;
  error?: string;
}

export default function BookingConfirmation({ 
  bookingData, 
  onClose, 
  success = true, 
  bookingId, 
  error 
}: BookingConfirmationProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!success) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
          >
            <XCircle className="h-8 w-8 text-red-600" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Failed</h3>
          <p className="text-sm text-gray-600">We couldn&apos;t complete your booking</p>
        </div>

        {/* Error Details */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">Error Details</h4>
                <p className="text-sm text-red-700">{error || 'An unexpected error occurred during booking.'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-sm text-gray-600">Your session has been successfully booked</p>
        {bookingId && (
          <p className="text-xs text-gray-500 mt-1">Booking ID: {bookingId}</p>
        )}
      </div>

      {/* Booking Details */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">Date</p>
                <p className="text-sm text-green-700">{formatDate(bookingData.selectedDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">Time</p>
                <p className="text-sm text-green-700">{formatTime(bookingData.selectedTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">Location</p>
                <p className="text-sm text-green-700">Online Session (Google Meet)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {bookingData.userDetails.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{bookingData.userDetails.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{bookingData.userDetails.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{bookingData.userDetails.phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-semibold text-primary">{formatPrice(bookingData.finalAmount)}</span>
          </div>
          {bookingData.couponCode && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Coupon: {bookingData.couponCode}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">What&apos;s Next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• You&apos;ll receive a confirmation email shortly</li>
            <li>• A calendar invite will be sent to your email</li>
            <li>• Join the session 5 minutes before the scheduled time</li>
            <li>• Check your email for the meeting link</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          onClick={() => window.open('/bookings', '_blank')}
          className="flex-1"
        >
          View My Bookings
        </Button>
      </div>
    </div>
  );
} 