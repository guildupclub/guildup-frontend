'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, 
  ChevronLeft, 
  ArrowRight,
  Heart,
  Brain,
  Users,
  Sparkles,
  Check,
  Phone,
  Mail,
  User,
  Calendar,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser, setSessionId } from '@/redux/userSlice';

interface LandingPageOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'mind' | 'body';
  onComplete?: (data: any) => void;
}

interface FormData {
  // Screen 2: Struggles
  struggles: string[];
  
  // Screen 3: Expert Type
  expertType: string;
  
  // Screen 4: Expert Gender Preference
  expertGender: string;
  
  // Screen 5: Language Preference
  languages: string[];
  otherLanguage: string;
  
  // Screen 6: Personal Info
  fullName: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
  otp: string;
}

const MIND_STRUGGLES = [
  { id: 'anxiety-stress', label: 'Feeling stressed or anxious', emoji: '😰' },
  { id: 'overthinking', label: "Can't stop overthinking", emoji: '🤯' },
  { id: 'trouble-sleeping', label: 'Trouble sleeping', emoji: '😴' },
  { id: 'relationship-hurt', label: 'Breakup or relationship hurt', emoji: '💔' },
  { id: 'feeling-low', label: 'Feeling low or sad', emoji: '😔' },
  { id: 'past-trauma', label: 'Past trauma or bad memories', emoji: '😞' },
  { id: 'marriage-trust', label: 'Marriage or trust problems', emoji: '💍' },
  { id: 'parenting', label: 'Parenting challenges', emoji: '👶' }
];

const BODY_STRUGGLES = [
  { id: 'lose-weight', label: 'Want to lose weight', emoji: '⚖️' },
  { id: 'gain-weight', label: 'Want to gain weight or muscle', emoji: '💪' },
  { id: 'pcos-thyroid', label: 'PCOS or thyroid problems', emoji: '🦋' },
  { id: 'digestion-gut', label: 'Digestion or gut issues', emoji: '🩺' },
  { id: 'always-tired', label: 'Always feeling tired', emoji: '😴' },
  { id: 'injury-pain', label: 'Injury or constant pain', emoji: '🤕' },
  { id: 'stiffness-flexibility', label: 'Stiffness or low flexibility', emoji: '🧘' }
];

// Get struggles based on variant - will be defined inside the component

const EXPERT_TYPES = [
  { id: 'therapist', label: 'Therapist / Counselor', emoji: '🧘‍♂️' },
  { id: 'nutritionist', label: 'Nutritionist', emoji: '🥗' },
  { id: 'fitness-coach', label: 'Fitness Coach', emoji: '🏋️' },
  { id: 'life-coach', label: 'Life Coach', emoji: '💬' },
  { id: 'not-sure', label: 'Not sure yet', emoji: '🤔' }
];

const EXPERT_GENDERS = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'no-preference', label: 'No preference', emoji: '👥' }
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'other', label: 'Other' }
];

const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export default function LandingPageOnboarding({
  isOpen, 
  onClose, 
  variant, 
  onComplete 
}: LandingPageOnboardingProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    struggles: [],
    expertType: '',
    expertGender: '',
    languages: [],
    otherLanguage: '',
    fullName: '',
    email: '',
    mobile: '+91 ',
    age: '',
    gender: '',
    otp: ''
  });

  const totalScreens = 6; // Including welcome and confirmation
  const progress = ((currentScreen - 1) / (totalScreens - 2)) * 100; // Exclude welcome and confirmation screens

  useEffect(() => {
    if (currentScreen === totalScreens) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [currentScreen, onClose, totalScreens]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'mind':
        return {
          primaryColor: 'from-purple-600 to-indigo-600',
          accentColor: 'purple',
          bgGradient: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700',
          icon: Brain
        };
      case 'body':
        return {
          primaryColor: 'from-green-600 to-emerald-600',
          accentColor: 'green',
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          icon: Heart
        };
    }
  };

  const config = getVariantConfig();
  const Icon = config.icon;

  // Get struggles based on variant
  const getStruggles = () => {
    return variant === 'mind' ? MIND_STRUGGLES : BODY_STRUGGLES;
  };

  const handleNext = () => {
    if (currentScreen < totalScreens) {
      setSlideDirection('right');
      setCurrentScreen(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      setSlideDirection('left');
      setCurrentScreen(prev => prev - 1);
    }
  };

  const handleStruggleToggle = (struggleId: string) => {
    setFormData(prev => ({
      ...prev,
      struggles: prev.struggles.includes(struggleId)
        ? prev.struggles.filter(id => id !== struggleId)
        : prev.struggles.length < 3
          ? [...prev.struggles, struggleId]
          : prev.struggles
    }));
  };

  const handleLanguageToggle = (languageId: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(languageId)
        ? prev.languages.filter(id => id !== languageId)
        : [...prev.languages, languageId]
    }));
  };

  const isScreenValid = (screen: number) => {
    switch (screen) {
      case 1: // Welcome - always valid
        return true;
      case 2: // Struggles - need at least 1 struggle selected
        return formData.struggles.length > 0;
      case 3: // Expert Gender - need to select gender preference
        return formData.expertGender !== '';
      case 4: // Language - need to select at least 1 language
        return formData.languages.length > 0;
      case 5: // Personal Info - need name, email, mobile, and verified OTP
        return formData.fullName.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.mobile.trim() !== '+91 ' && 
               isOtpVerified;
      default:
        return false;
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/request-otp`, {
        phone: formData.mobile.replace(/\D/g, '')
      });
      if (response.data.r === 's') {
        toast.success('OTP sent to your WhatsApp number!');
        setIsOtpSent(true);
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/verify-otp`, {
        phone: formData.mobile.replace(/\D/g, ''),
        otp: formData.otp,
        name: formData.fullName,
        email: formData.email
      });
      if (response.data.r === 's') {
        toast.success('OTP verified successfully!');
        setIsOtpVerified(true);
        const { user, token } = response.data.data;
        dispatch(setUser(user));
        dispatch(setSessionId(token));
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (onComplete) {
        onComplete(formData);
      }
      // API call removed - now handled by the pages' onComplete callbacks
      // This prevents duplicate API calls and ensures consistency
      
      toast.success("Thank you! We'll help match you with the right expert shortly.");
      
      setCurrentScreen(totalScreens); // Show confirmation screen
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderScreen = () => {
    const slideClass = slideDirection === 'right' ? 'slide-in-right' : 'slide-in-left';
    
    switch (currentScreen) {
      case 1: // Welcome
        return (
          <div className={`text-center space-y-6 ${slideClass}`}>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Icon className="w-10 h-10 text-purple-600" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                🙋‍♀️ We&apos;re here to help you!
              </h2>
              <p className="text-gray-600 text-lg">
                Answer a few quick questions so we can guide you to the right expert.
              </p>
            </div>
            
            <Button
              onClick={handleNext}
              className={`w-full bg-gradient-to-r ${config.primaryColor} text-white text-lg py-4 hover:opacity-90 transition-all duration-300`}
            >
              Let&apos;s Go →
            </Button>
          </div>
        );

      case 2: // Struggles (variant-specific)
        return (
          <div className={`space-y-6 ${slideClass}`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                What&apos;s bothering you right now?
              </h2>
              <p className="text-gray-600 text-sm">
                Pick up to 3
              </p>
            </div>
            
            <div className="grid gap-3">
              {getStruggles().map((struggle) => (
                <div
                  key={struggle.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${ 
                    formData.struggles.includes(struggle.id)
                      ? `${config.borderColor} bg-gradient-to-r ${config.bgGradient}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStruggleToggle(struggle.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{struggle.emoji}</span>
                    <span className="font-medium text-gray-900">{struggle.label}</span>
                    {formData.struggles.includes(struggle.id) && (
                      <Check className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {formData.struggles.length >= 3 && (
              <p className="text-sm text-gray-500 text-center">
                You&apos;ve selected 3 items. You can deselect to choose different ones.
              </p>
            )}
          </div>
        );

      case 3: // Expert Gender
        return (
          <div className={`space-y-6 ${slideClass}`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                What&apos;s your preferred expert type?
              </h2>
            </div>
            
            <div className="grid gap-3">
              {EXPERT_GENDERS.map((gender) => (
                <div
                  key={gender.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${ 
                    formData.expertGender === gender.id
                      ? `${config.borderColor} bg-gradient-to-r ${config.bgGradient}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, expertGender: gender.id }))}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{gender.emoji}</span>
                    <span className="font-medium text-gray-900">{gender.label}</span>
                    {formData.expertGender === gender.id && (
                      <Check className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // Language
        return (
          <div className={`space-y-6 ${slideClass}`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Language preference
              </h2>
            </div>
            
            <div className="space-y-3">
              {LANGUAGES.map((language) => (
                <div
                  key={language.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${ 
                    formData.languages.includes(language.id)
                      ? `${config.borderColor} bg-gradient-to-r ${config.bgGradient}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLanguageToggle(language.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{language.label}</span>
                    {formData.languages.includes(language.id) && (
                      <Check className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {formData.languages.includes('other') && (
              <div className="mt-4">
                <Label htmlFor="otherLanguage">Please specify:</Label>
                <Input
                  id="otherLanguage"
                  value={formData.otherLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherLanguage: e.target.value }))}
                  placeholder="Enter language"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      case 5: // Personal Info
        return (
          <div className={`space-y-6 ${slideClass}`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                📇 Just a few details to reach you
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Age"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.id} value={gender.id}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mobile">WhatsApp Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Enter your WhatsApp number"
                    className="pl-10"
                    disabled={isOtpSent}
                  />
                </div>

                
                {!isOtpSent ? (
                  <Button
                    type="button"
                    className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={handleSendOtp}
                    disabled={isLoading || !formData.mobile.trim() || formData.mobile.trim().length < 10}
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                ) : (
                  <div className="mt-4">
                    <Label htmlFor="otp">Enter OTP *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="otp"
                        type="text"
                        value={formData.otp}
                        onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                        placeholder="Enter 6-digit OTP"
                        className="pl-10"
                        maxLength={6}
                        disabled={isOtpVerified}
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || !formData.otp.trim() || formData.otp.trim().length !== 6 || isOtpVerified}
                    >
                      {isLoading ? 'Verifying...' : isOtpVerified ? 'Verified' : 'Verify OTP'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7: // Confirmation
        return (
          <div className={`text-center space-y-6 ${slideClass}`}>
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                🎉 Thank you! We&apos;ll help match you with the right expert.
              </h2>
              <p className="text-gray-600">
                Meanwhile, feel free to browse expert profiles below 👇
              </p>
            </div>
            
            <Button
              onClick={onClose}
              className={`w-full bg-gradient-to-r ${config.primaryColor} text-white text-lg py-4 hover:opacity-90 transition-all duration-300`}
            >
              Start Exploring
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {currentScreen > 1 && currentScreen < totalScreens && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex-1 text-center">
            {currentScreen > 1 && currentScreen < totalScreens && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Step {currentScreen - 1} of {totalScreens - 2}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${config.primaryColor} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderScreen()}
        </div>

        {/* Footer */}
        {currentScreen > 1 && currentScreen < totalScreens && (
          <div className="p-4 border-t border-gray-100">
            <Button
              onClick={currentScreen === 5 ? handleSubmit : handleNext}
              disabled={!isScreenValid(currentScreen) || isLoading || (currentScreen === 5 && !isOtpVerified)}
              className={`w-full bg-gradient-to-r ${config.primaryColor} text-white py-3 hover:opacity-90 transition-all duration-300`}
            >
              {isLoading && currentScreen !== 5 ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : currentScreen === 5 ? (
                'Complete & Get Matched'
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}