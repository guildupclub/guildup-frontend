'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  User, 
  Target, 
  Heart,
  Brain,
  Users,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import axios from 'axios';

interface OnboardingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  variant?: 'default' | 'mind' | 'community' | 'creator';
  title?: string;
  description?: string;
}

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone: string;
  
  // Step 2: Goals & Interests
  primaryGoal: string;
  interests: string[];
  experienceLevel: string;
  
  // Step 3: Preferences
  preferredSessionType: string[];
  budgetRange: string;
  availability: string[];
  timezone: string;
  
  // Step 4: Additional Info
  currentChallenges: string;
  expectations: string;
  referralSource: string;
}

const GOALS = [
  { id: 'mental-health', label: 'Mental Health & Wellness', icon: Brain },
  { id: 'career-growth', label: 'Career Growth', icon: Target },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'personal-development', label: 'Personal Development', icon: Sparkles },
  { id: 'community', label: 'Join Communities', icon: Users },
  { id: 'expertise', label: 'Learn from Experts', icon: Star }
];

const INTERESTS = [
  'Therapy & Counseling', 'Life Coaching', 'Career Coaching', 'Mindfulness',
  'Leadership', 'Communication', 'Stress Management', 'Goal Setting',
  'Personal Finance', 'Health & Fitness', 'Spirituality', 'Creativity',
  'Technology', 'Business', 'Education', 'Parenting'
];

const SESSION_TYPES = [
  '1-on-1 Sessions', 'Group Sessions', 'Workshops', 'Webinars',
  'Discovery Calls', 'Consultations', 'Mentoring'
];

const BUDGET_RANGES = [
  'Free (GUILD100)', '₹500-1000', '₹1000-2000', '₹2000-5000', '₹5000+'
];

const AVAILABILITY = [
  'Weekdays', 'Weekends', 'Evenings', 'Mornings', 'Flexible'
];

const TIMEZONES = [
  'IST (UTC+5:30)', 'PST (UTC-8)', 'EST (UTC-5)', 'GMT (UTC+0)',
  'CET (UTC+1)', 'JST (UTC+9)', 'AEST (UTC+10)'
];

export default function OnboardingForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  variant = 'default',
  title,
  description 
}: OnboardingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    primaryGoal: '',
    interests: [],
    experienceLevel: '',
    preferredSessionType: [],
    budgetRange: '',
    availability: [],
    timezone: 'IST (UTC+5:30)',
    currentChallenges: '',
    expectations: '',
    referralSource: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Auto-close if user signs in
  useEffect(() => {
    if (session && isOpen) {
      onClose();
      if (onSuccess) onSuccess();
    }
  }, [session, isOpen, onClose, onSuccess]);

  const getVariantConfig = () => {
    switch (variant) {
      case 'mind':
        return {
          title: title || 'Start Your Mental Wellness Journey',
          description: description || 'Get matched with verified therapists and wellness experts',
          primaryColor: 'from-indigo-600 to-purple-600',
          accentColor: 'indigo'
        };
      case 'community':
        return {
          title: title || 'Join Our Community',
          description: description || 'Connect with like-minded people and experts',
          primaryColor: 'from-green-600 to-emerald-600',
          accentColor: 'green'
        };
      case 'creator':
        return {
          title: title || 'Become an Expert',
          description: description || 'Share your expertise and help others grow',
          primaryColor: 'from-orange-600 to-red-600',
          accentColor: 'orange'
        };
      default:
        return {
          title: title || 'Welcome to GuildUp',
          description: description || 'Your journey to personal growth starts here',
          primaryColor: 'from-blue-600 to-indigo-600',
          accentColor: 'blue'
        };
    }
  };

  const config = getVariantConfig();

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[])?.includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.email.trim();
      case 2:
        return formData.primaryGoal && formData.interests.length > 0;
      case 3:
        return formData.preferredSessionType.length > 0 && formData.budgetRange;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: window.location.href,
      state: JSON.stringify({ onboarding: true, variant, formData })
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/onboarding-user`, {
        ...formData,
        variant,
        timestamp: new Date().toISOString()
      });

      toast.success('Onboarding completed! Redirecting to sign up...');
      
      // Redirect to sign up with onboarding data
      router.push(`/api/auth/signup?onboarding=true&variant=${variant}`);
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Tell us about yourself</h3>
              <p className="text-gray-600">Let&apos;s start with the basics</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">What are your goals?</h3>
              <p className="text-gray-600">Help us match you with the right experts</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Primary Goal *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.primaryGoal === goal.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('primaryGoal', goal.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium">{goal.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <Label>Areas of Interest *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleArrayToggle('interests', interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleInputChange('experienceLevel', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Your Preferences</h3>
              <p className="text-gray-600">Customize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Preferred Session Types *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {SESSION_TYPES.map((type) => (
                    <div
                      key={type}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.preferredSessionType.includes(type)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleArrayToggle('preferredSessionType', type)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        {formData.preferredSessionType.includes(type) && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="budgetRange">Budget Range *</Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) => handleInputChange('budgetRange', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Preferred Availability</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABILITY.map((time) => (
                    <Badge
                      key={time}
                      variant={formData.availability.includes(time) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        formData.availability.includes(time)
                          ? 'bg-green-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleArrayToggle('availability', time)}
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleInputChange('timezone', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold">Almost there!</h3>
              <p className="text-gray-600">A few more details to personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentChallenges">Current Challenges (Optional)</Label>
                <Textarea
                  id="currentChallenges"
                  value={formData.currentChallenges}
                  onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                  placeholder="What challenges are you currently facing?"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="expectations">What do you hope to achieve? (Optional)</Label>
                <Textarea
                  id="expectations"
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                  placeholder="What are your expectations from this platform?"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="referralSource">How did you hear about us? (Optional)</Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => handleInputChange('referralSource', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="search">Search Engine</SelectItem>
                    <SelectItem value="friend">Friend/Family</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="blog">Blog/Article</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {config.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {config.description}
              </DialogDescription>
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
          
          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep) || isLoading}
                className={`bg-gradient-to-r ${config.primaryColor} text-white hover:opacity-90`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`bg-gradient-to-r ${config.primaryColor} text-white hover:opacity-90`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
