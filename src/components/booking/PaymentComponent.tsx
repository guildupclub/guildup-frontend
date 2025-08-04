"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, Loader2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { createAuthenticatedRequest } from '@/utils/api';
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

interface BookingData {
  selectedDate: string;
  selectedTime: string;
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

interface PaymentComponentProps {
  offering: Offering;
  bookingData: BookingData;
  onComplete: (result: { success: boolean; bookingId?: string; error?: string }) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentComponent({ 
  offering, 
  bookingData, 
  onComplete, 
  onBack 
}: PaymentComponentProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const createRazorpayOrder = async () => {
    // Check if user is authenticated - use provided userId or session
    const effectiveUserId = bookingData.userId || session?.user?._id;
    if (!effectiveUserId) {
      throw new Error('Please sign in to proceed with payment');
    }

    try {
      console.log('Creating Razorpay order with payload:', {
        offering_id: offering._id,
        user_id: effectiveUserId,
        amount: bookingData.finalAmount,
        startTime: `${bookingData.selectedDate}T${bookingData.selectedTime}`,
        couponCode: bookingData.couponCode
      });

      // Use authenticated request
      const api = createAuthenticatedRequest(bookingData.authToken);
                const response = await api.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING || 'http://localhost:8080'}/payment/create-order`,
            {
              offering_id: offering._id,
              user_id: effectiveUserId,
              amount: bookingData.finalAmount,
              startTime: `${bookingData.selectedDate}T${bookingData.selectedTime}`,
              couponCode: bookingData.couponCode
            }
          );

      if (response.data.r === 's') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create payment order');
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      throw new Error(err.response?.data?.message || err.message || 'Failed to create payment order');
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Razorpay order
      const orderData = await createRazorpayOrder();

      // Check if this is a free offering (booking already created)
      if (bookingData.finalAmount === 0) {
        console.log('Free offering - booking already created:', orderData);
        onComplete({ 
          success: true, 
          bookingId: orderData._id 
        });
        return;
      }

      // Validate orderData for paid offerings
      if (!orderData || !orderData.amount || !orderData.currency || !orderData.id) {
        throw new Error('Invalid order data received from server');
      }

      console.log('Order data received:', orderData);

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GuildUp',
        description: 'Slot Booking Payment',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const dateObj = new Date(bookingData.selectedDate);
            dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
            const startTime = dateObj.toISOString().slice(0, 19);


            // Verify payment
            // const verifyApi = createAuthenticatedRequest(bookingData.authToken);
            const verifyResponse = await axios.post(
               `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
               {
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 user_id: session?.user?._id,
                 offering_id: offering._id,
                 startTime: startTime,
                 couponCode: bookingData?.couponCode || null
               }
             );

            console.log('Payment verification response:', verifyResponse.data);
            
            if (verifyResponse.data.r === 's') {
              onComplete({ 
                success: true, 
                bookingId: verifyResponse.data.data.booking._id 
              });
            } else {
              onComplete({ 
                success: false, 
                error: verifyResponse.data.message || 'Payment verification failed' 
              });
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            onComplete({ 
              success: false, 
              error: 'Payment verification failed' 
            });
          }
        },
        prefill: {
          name: bookingData.userDetails.name,
          email: bookingData.userDetails.email,
          contact: bookingData.userDetails.phone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      console.error('Payment error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
        <p className="text-sm text-gray-600">Secure payment powered by Razorpay</p>
      </div>

      {/* Booking Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{offering.title}</h4>
              <p className="text-sm text-gray-600">{offering.duration} minutes</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {formatPrice(bookingData.finalAmount)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatDate(bookingData.selectedDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatTime(bookingData.selectedTime)}
              </span>
            </div>
          </div>

          {bookingData.couponCode && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
              <span className="text-sm text-green-700">
                Coupon applied: {bookingData.couponCode}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Original Price:</span>
            <span>{formatPrice(offering.price.amount)}</span>
          </div>
          {offering.discounted_price && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discounted Price:</span>
              <span className="text-primary">{formatPrice(offering.discounted_price)}</span>
            </div>
          )}
          {bookingData.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount:</span>
              <span>-{formatPrice(bookingData.discountAmount)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total Amount:</span>
            <span className="text-primary">{formatPrice(bookingData.finalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
              <p className="text-sm text-blue-700">
                Your payment is secured by Razorpay. We use industry-standard encryption to protect your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatPrice(bookingData.finalAmount)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 