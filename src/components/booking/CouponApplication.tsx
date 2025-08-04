"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, CheckCircle, XCircle, Loader2, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { createAuthenticatedRequest } from '@/utils/api';

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

interface CouponApplicationProps {
  offering: Offering;
  currentAmount: number;
  userId?: string;
  authToken?: string;
  onComplete: (data: { couponCode: string | null; discountAmount: number; finalAmount: number }) => void;
  onBack: () => void;
}

interface CouponResult {
  valid: boolean;
  discount: number;
  finalTotal: number;
  message: string;
}

export default function CouponApplication({ 
  offering, 
  currentAmount, 
  userId,
  authToken,
  onComplete, 
  onBack 
}: CouponApplicationProps) {
  const { data: session } = useSession();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(currentAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    // Check if user is authenticated - use provided userId or session
    const effectiveUserId = userId || session?.user?._id;
    if (!effectiveUserId) {
      setError('Please sign in to apply coupon codes');
      return;
    }

    // Validate required fields
    if (!offering._id) {
      setError('Offering ID is missing');
      return;
    }

    if (typeof currentAmount !== 'number' && typeof currentAmount !== 'object') {
      setError('Invalid amount format');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/coupon/preview`;
      // Ensure cartTotal is a number
      const cartTotal = typeof currentAmount === 'number' ? currentAmount : 
        (typeof currentAmount === 'object' && currentAmount?.amount ? currentAmount.amount : 
        (typeof currentAmount === 'string' ? parseFloat(currentAmount) : 0));

      const payload = {
        code: couponCode.trim().toUpperCase(),
        userId: effectiveUserId,
        cartTotal: cartTotal,
        offeringId: offering._id
      };

      console.log('Applying coupon with payload:', payload);
      console.log('API URL:', apiUrl);
      console.log('Auth token available:', !!authToken);
      console.log('Payload data types:', {
        code: typeof payload.code,
        userId: typeof payload.userId,
        cartTotal: typeof payload.cartTotal,
        offeringId: typeof payload.offeringId
      });

      // Use authenticated request
      const api = createAuthenticatedRequest(authToken);
      const response = await api.post(apiUrl, payload);

      console.log('Coupon API response:', response.data);

      if (response.data.valid) {
        setAppliedCoupon(couponCode.toUpperCase());
        setDiscountAmount(response.data.discount);
        setFinalAmount(response.data.finalTotal);
        // Note: setCouponMessage was not implemented, removing the call
        setCouponResult(response.data);
        setError(null);
      } else {
        setError('Invalid coupon code');
        setCouponResult(null);
      }
    } catch (err: any) {
      console.error('Error applying coupon:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        message: err.message,
        code: err.code
      });
      
      // Provide more specific error messages
      if (err.code === 'ECONNREFUSED') {
        setError('Unable to connect to server. Please check if the backend service is running.');
      } else if (err.response?.status === 404) {
        setError('Coupon not found. Please check the coupon code.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid coupon code or requirements not met.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.message || 'You are not eligible for this coupon.');
      } else if (err.response?.status === 500) {
        console.error('Server error details:', err.response.data);
        setError('Server error occurred. Please try again later or contact support.');
      } else {
        setError('Oops! Something went wrong. Please try again later.');
      }
      setCouponResult(null);
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(currentAmount);
    setCouponCode('');
    setCouponResult(null);
    setError(null);
  };

  const handleContinue = () => {
    onComplete({
      couponCode: appliedCoupon,
      discountAmount,
      finalAmount
    });
  };

  const handleSkip = () => {
    onComplete({
      couponCode: null,
      discountAmount: 0,
      finalAmount: currentAmount
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply Coupon Code</h3>
        <p className="text-sm text-black">Enter a coupon code to get additional discounts</p>
      </div>

      {/* Price Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-black">Original Price:</span>
              <span className="font-medium">{formatPrice(offering.price.amount)}</span>
            </div>
            {offering.discounted_price && (
              <div className="flex justify-between">
                <span className="text-black">Discounted Price:</span>
                <span className="font-medium text-primary">{formatPrice(offering.discounted_price)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Final Amount:</span>
              <span className="text-primary">{formatPrice(finalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Coupon Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
                maxLength={20}
              />
              <Button
                onClick={applyCoupon}
                disabled={loading || !couponCode.trim()}
                className="whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Coupon Applied: {appliedCoupon}</span>
              </div>
              <Button
                onClick={removeCoupon}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Coupon Result */}
          {couponResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Coupon Applied Successfully!</span>
              </div>
              <p className="text-sm text-primary">{couponResult.message}</p>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

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
          variant="outline"
          onClick={handleSkip}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
} 


