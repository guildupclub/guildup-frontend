"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CreditCard, CheckCircle, XCircle, ArrowLeft, ArrowRight, Star, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { 
  DateSelectionStep, 
  TimeSelectionStep, 
  UserDetailsStep, 
  CouponStep, 
  PaymentStep 
} from '@/components/booking/BookingSteps';

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
  provider?: {
    name: string;
    avatar?: string;
    expertise?: string;
    experience?: number;
    rating?: number;
    reviewCount?: number;
  };
  community?: {
    name: string;
    description?: string;
  };
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

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  const offeringId = params["offeringId"] as string;
  
  // Extract community ID from the parameter (format: "community-name-communityId")
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityId = lastHyphenIndex !== -1 ? communityParam.substring(lastHyphenIndex + 1) : communityParam;
  
  const [offering, setOffering] = useState<Offering | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedDate: null,
    selectedTime: null,
    userDetails: { name: '', email: '', phone: '' },
    couponCode: null,
    discountAmount: 0,
    finalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  useEffect(() => {
    if (offeringId) {
      fetchOffering();
    }
  }, [offeringId]);

  const fetchOffering = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/offerings/${offeringId}`);
      if (response.data) {
        setOffering(response.data);
        setBookingData(prev => ({
          ...prev,
          finalAmount: response.data.discounted_price || response.data.price.amount
        }));
      }
    } catch (err: any) {
      console.error('Error fetching offering:', err);
      setError('Failed to load offering details');
    } finally {
      setLoading(false);
    }
  };

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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offering details...</p>
        </div>
      </div>
    );
  }

  if (error || !offering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Offering not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Book Your Session</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {STEPS.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold text-primary">{Math.round(progress)}%</p>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Offering Details */}
          <div className="space-y-6">
            {/* Provider Profile */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {offering.provider?.avatar ? (
                      <img 
                        src={offering.provider.avatar} 
                        alt={offering.provider.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {offering.provider?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {offering.provider?.name || 'Expert'}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      {offering.provider?.expertise || 'Professional'}
                    </p>
                    {offering.provider?.rating && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {offering.provider.rating} ({offering.provider.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience & Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Expertise</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{offering.provider?.experience || 5}+</p>
                    <p className="text-sm text-gray-600">Years of Experience</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">100+</p>
                    <p className="text-sm text-gray-600">Sessions Conducted</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">20</p>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">4.8</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Details */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="bg-primary text-white px-6 py-3 rounded-lg inline-block">
                    <p className="text-2xl font-bold">
                      {offering.discounted_price === 0 ? 'Free' : formatPrice(offering.discounted_price || offering.price.amount)}
                    </p>
                    {offering.discounted_price && offering.discounted_price < offering.price.amount && (
                      <p className="text-sm line-through opacity-75">
                        {formatPrice(offering.price.amount)}
                      </p>
                    )}
                    <p className="text-sm">{offering.duration} min consultation</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">{offering.title}</h3>
                <p className="text-gray-600 mb-4">{offering.description}</p>

                {offering.community && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Community: {offering.community.name}</h4>
                    {offering.community.description && (
                      <p className="text-sm text-blue-700">{offering.community.description}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Booking Interface */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {STEPS[currentStep - 1].title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentStep === 1 && 'Choose a date for your session'}
                    {currentStep === 2 && 'Select your preferred time slot'}
                    {currentStep === 3 && 'Provide your contact information'}
                    {currentStep === 4 && 'Apply a coupon code (optional)'}
                    {currentStep === 5 && 'Complete your payment'}
                  </p>
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                  <DateSelectionStep 
                    offering={offering}
                    selectedDate={bookingData.selectedDate}
                    onDateSelect={(date) => {
                      updateBookingData({ selectedDate: date });
                      nextStep();
                    }}
                  />
                )}

                {currentStep === 2 && bookingData.selectedDate && (
                  <TimeSelectionStep
                    offering={offering}
                    selectedDate={bookingData.selectedDate}
                    selectedTime={bookingData.selectedTime}
                    onTimeSelect={(time) => {
                      updateBookingData({ selectedTime: time });
                      nextStep();
                    }}
                    onBack={prevStep}
                  />
                )}

                {currentStep === 3 && (
                  <UserDetailsStep
                    onComplete={handleStepComplete}
                    onBack={prevStep}
                  />
                )}

                {currentStep === 4 && (
                  <CouponStep
                    offering={offering}
                    currentAmount={bookingData.finalAmount}
                    userId={bookingData.userId}
                    authToken={bookingData.authToken}
                    onComplete={handleStepComplete}
                    onBack={prevStep}
                  />
                )}

                {currentStep === 5 && (
                  <PaymentStep
                    offering={offering}
                    bookingData={bookingData}
                    onComplete={(result) => {
                      if (result.success) {
                        router.push(`/booking/confirmation/${result.bookingId}`);
                      } else {
                        setError(result.error);
                      }
                    }}
                    onBack={prevStep}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 