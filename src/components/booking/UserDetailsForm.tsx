"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession, signIn } from 'next-auth/react';
import axios from 'axios';
import { getAuthToken } from '@/utils/api';
import { toast } from 'sonner';
import { setUser } from '@/redux/userSlice';

interface UserDetailsFormProps {
  onComplete: (data: { 
    userDetails: { name: string; email: string; phone: string };
    userId?: string;
    authToken?: string;
  }) => void;
  onBack: () => void;
}

export default function UserDetailsForm({ onComplete, onBack }: UserDetailsFormProps) {
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [authData, setAuthData] = useState<{ userId?: string; token?: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const formatPhoneForAPI = (phone: string) => {
    // Remove all non-digits - backend expects just digits, no + symbol

    return phone.replace("+" ,""); // Return as is if it doesn't match expected format
  };

  const sendOtp = async () => {
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Check if backend URL is configured
    if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
      setError('Backend URL is not configured. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Log the request payload for debugging
      console.log('Sending OTP request for phone:', formatPhoneForAPI(formData.phone));
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_BASE_URL);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/request-otp`,
        {
          phone: formatPhoneForAPI(formData.phone)
        }
      );

      if (response.data.r === 's') {
        setOtpSent(true);
        setShowOtpInput(true);
        setError(null);
      } else {
        setError(response.data.e || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      setError(err.response?.data?.e || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    // Additional validation to ensure we have all required data
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    // Check if backend URL is configured
    if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
      setError('Oops! Something went wrong. Please try again later.');
      console.log('Backend URL is not configured. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Log the request payload for debugging
      console.log('Verifying OTP with payload:', {
        phone: formatPhoneForAPI(formData.phone),
        otp: otp,
        name: formData.name,
        email: formData.email
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/verify-otp`,
        {
          phone: formatPhoneForAPI(formData.phone),
          otp: otp,
          name: formData.name,
          email: formData.email
        }
      );

      if (response.data.r === 's') {
        toast.success('Login successful');
        const {user, token} = response.data.data;

        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('name', user.name);
        sessionStorage.setItem('id', user._id);
        sessionStorage.setItem('email', user.email);

        // Note: Removed Redux dispatch and setter calls as they were not implemented
        // The user data is already being stored in sessionStorage and authData state

        setPhoneVerified(true);
        setError(null);
        
        // Handle the authentication response from backend
        const authData = response.data.data;
        console.log('Authentication successful:', authData);
        
        // Store authentication data for use in subsequent steps
        setAuthData({
          userId: authData.user?._id,
          token: authData.token
        });
        
        // Store the JWT token in localStorage for API calls
        if (authData.token) {
          localStorage.setItem('authToken', authData.token);
          console.log('JWT token stored for API calls');
        }
        
        // Auto-login the user after successful OTP verification
        try {
          console.log('Auto-logging in user after OTP verification');
          
          // Check if user is already logged in
          if (session?.user?._id) {
            console.log('User is already logged in, skipping auto-login');
            setLoginSuccess(true);
            return;
          }
          
          // Retry mechanism for auto-login (in case user creation takes time)
          let loginResult = null;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              console.log(`Attempting auto-login (attempt ${retryCount + 1}/${maxRetries})`);
              
              // Use the phone number as credentials for login
              loginResult = await signIn('credentials', {
                phone: formatPhoneForAPI(formData.phone),
                redirect: false,
              });
              
              if (loginResult?.error) {
                console.warn(`Auto-login attempt ${retryCount + 1} failed:`, loginResult.error);
                
                // If it's a "User not found" error, don't retry as the user might not exist in NextAuth yet
                if (loginResult.error === 'User not found') {
                  console.log('User not found in NextAuth - this is expected for new users');
                  break;
                }
                
                retryCount++;
                
                if (retryCount < maxRetries) {
                  // Wait before retrying
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              } else {
                setLoginSuccess(true);
                console.log('Auto-login successful');
                break;
              }
            } catch (attemptError) {
              console.warn(`Auto-login attempt ${retryCount + 1} error:`, attemptError);
              retryCount++;
              
              if (retryCount < maxRetries) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (loginResult?.error) {
            console.warn('Auto-login failed:', loginResult.error);
            // Don't show error to user as they can still proceed with booking
            // The user data from the backend response can still be used
            // Set login success anyway since we have valid user data from OTP verification
            setLoginSuccess(true);
          } else {
            console.log('Auto-login successful after retries');
            
            // Force session update to ensure the session is properly set
            await update();
            
            // Small delay to ensure session is properly updated
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setLoginSuccess(true);
            console.log('Session updated after auto-login');
          }
        } catch (loginError) {
          console.warn('Auto-login error:', loginError);
          // Don't show error to user as they can still proceed with booking
          // The user data from the backend response can still be used
        }
      } else {
        setError(response.data.e || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      setError(err.response?.data?.e || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Validate all fields
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phoneVerified) {
      setError('Please verify your phone number with OTP');
      return;
    }

    // Pass user details along with authentication data
    onComplete({ 
      userDetails: formData,
      userId: authData?.userId || session?.user?._id,
      authToken: authData?.token
    });
  };

  // Check if user is already logged in
  const isAlreadyLoggedIn = session?.user?._id;
  
  // Debug session state
  console.log('Current session state:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?._id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userPhone: session?.user?.phone
  });

  // Monitor session changes and update login success state
  useEffect(() => {
    if (session?.user?._id && phoneVerified) {
      setLoginSuccess(true);
    }
  }, [session, phoneVerified]);

  // Pre-fill form with existing user data if logged in
  useEffect(() => {
    if (session?.user?._id && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || ''
      }));
      
      // If user is already logged in and has phone, mark as verified
      if (session.user.phone) {
        setPhoneVerified(true);
        setOtpSent(true);
        setShowOtpInput(false);
        
        // Set auth data for already logged in users
        setAuthData({
          userId: session.user._id,
          token: getAuthToken() || undefined
        });
      }
    }
  }, [session, formData.name, formData.email]);

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      validateEmail(formData.email) &&
      phoneVerified
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Details</h3>
        <p className="text-sm text-gray-600">Please provide your information to complete the booking</p>
        {isAlreadyLoggedIn && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">You are already logged in as {session.user.name || session.user.email}</p>
          </div>
        )}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="flex-1"
                maxLength={10}
              />
              <Button
                onClick={sendOtp}
                disabled={loading || !validatePhone(formData.phone) || otpSent}
                variant="outline"
                className="whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : otpSent ? (
                  'OTP Sent'
                ) : (
                  'Send OTP'
                )}
              </Button>
            </div>
          </div>

          {/* OTP Input */}
          {showOtpInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Label htmlFor="otp" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Enter OTP *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1"
                  maxLength={6}
                />
                <Button
                  onClick={verifyOtp}
                  disabled={loading || !otp || otp.length !== 6 || phoneVerified}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : phoneVerified ? (
                    'Verified'
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Phone Verification Status */}
          {phoneVerified && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Phone number verified successfully</span>
            </motion.div>
          )}

          {/* Login Success Message */}
          {loginSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Successfully logged in! You can now proceed with your booking.</span>
            </motion.div>
          )}
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
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!isFormValid() || loading}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 



