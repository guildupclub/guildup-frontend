"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CreditCard, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Step components
import DateSelection from './DateSelection';
import TimeSlotSelection from './TimeSlotSelection';
import UserDetailsForm from './UserDetailsForm';
import CouponApplication from './CouponApplication';
import PaymentComponent from './PaymentComponent';
import BookingConfirmation from './BookingConfirmation';

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

interface BookingFlowProps {
  offering: Offering;
  isOpen: boolean;
  onClose: () => void;
}

interface BookingData {
  selectedDate: string | null;
  selectedTime: string | null;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  userId?: string;
  authToken?: string;
  couponCode: string | null;
  discountAmount: number;
  finalAmount: number;
}

const STEPS = [
  { id: 1, title: 'Select Date', icon: Calendar },
  { id: 2, title: 'Choose Time', icon: Clock },
  { id: 3, title: 'Your Details', icon: User },
  { id: 4, title: 'Apply Coupon', icon: CreditCard },
  { id: 5, title: 'Payment', icon: CreditCard },
];

export default function BookingFlow({ offering, isOpen, onClose }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedDate: null,
    selectedTime: null,
    userDetails: { name: '', email: '', phone: '' },
    couponCode: null,
    discountAmount: 0,
    finalAmount: offering.discounted_price || offering.price.amount,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleStepComplete = (stepData: any) => {
    // Handle special case for user details step which includes authentication data
    if (stepData.userDetails && (stepData.userId || stepData.authToken)) {
      updateBookingData({
        userDetails: stepData.userDetails,
        userId: stepData.userId,
        authToken: stepData.authToken
      });
    } else {
      updateBookingData(stepData);
    }
    nextStep();
  };

  const handleBookingComplete = (result: { success: boolean; bookingId?: string; error?: string }) => {
    if (result.success) {
      setCurrentStep(6); // Confirmation step
    } else {
      setError(result.error || 'Booking failed. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateSelection
            offering={offering}
            onComplete={(data) => handleStepComplete(data)}
            onBack={onClose}
          />
        );
      case 2:
        return (
          <TimeSlotSelection
            offering={offering}
            selectedDate={bookingData.selectedDate!}
            onComplete={(data) => handleStepComplete(data)}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <UserDetailsForm
            onComplete={(data) => handleStepComplete(data)}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <CouponApplication
            offering={offering}
            currentAmount={bookingData.finalAmount}
            userId={bookingData.userId}
            authToken={bookingData.authToken}
            onComplete={(data) => handleStepComplete(data)}
            onBack={prevStep}
          />
        );
      case 5:
        // Type guard to ensure date and time are selected
        if (!bookingData.selectedDate || !bookingData.selectedTime) {
          setError("Date and time must be selected to proceed to payment.");
          return null;
        }
        return (
          <PaymentComponent
            offering={offering}
            bookingData={{
              ...bookingData,
              selectedDate: bookingData.selectedDate,
              selectedTime: bookingData.selectedTime,
            }}
            onComplete={handleBookingComplete}
            onBack={prevStep}
          />
        );
      case 6:
        // Type guard to ensure date and time are selected
        if (!bookingData.selectedDate || !bookingData.selectedTime) {
          setError("Booking data is incomplete for confirmation.");
          return null;
        }
        return (
          <BookingConfirmation
            bookingData={{
              ...bookingData,
              selectedDate: bookingData.selectedDate,
              selectedTime: bookingData.selectedTime,
            }}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Book Your Session</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index + 1 <= currentStep ? 'text-white' : 'text-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  index + 1 <= currentStep ? 'bg-white text-primary' : 'bg-white/20'
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 