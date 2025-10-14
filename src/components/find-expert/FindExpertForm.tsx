'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ArrowRight,
  Brain,
  Briefcase,
  Heart,
  Dumbbell,
  Sparkles,
  Check,
  Phone,
  Mail,
  User,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface FormData {
  painPoints: string[];
  duration: string;
  previousHelp: string;
  fullName: string;
  email: string;
  mobile: string;
  age: string;
}

const PAIN_POINTS = [
  { id: 'stress-anxiety', label: 'Stress, Anxiety & Burnout', emoji: '🧠', icon: Brain, color: 'from-purple-500 to-indigo-500' },
  { id: 'career', label: 'Career & Professional Growth', emoji: '💼', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  { id: 'relationships', label: 'Relationships & Parenting', emoji: '❤️', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'weight-fitness', label: 'Weight Loss & Fitness', emoji: '💪', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
  { id: 'pcos-hormonal', label: 'PCOS/PCOD & Hormonal Health', emoji: '🌸', icon: Sparkles, color: 'from-orange-500 to-amber-500' }
];

const DURATION_OPTIONS = [
  { id: 'less-than-month', label: 'Less than a month', emoji: '🆕' },
  { id: '1-3-months', label: '1-3 months', emoji: '📅' },
  { id: '3-6-months', label: '3-6 months', emoji: '⏰' },
  { id: 'greater-than-6', label: 'Greater than 6 months', emoji: '🔄' }
];

const PREVIOUS_HELP_OPTIONS = [
  { id: 'never', label: 'Never tried before', emoji: '🆕' },
  { id: 'tried-once', label: 'Yes, once or twice', emoji: '👍' },
  { id: 'multiple-times', label: 'Yes, multiple times', emoji: '🔄' },
  { id: 'currently-working', label: 'Currently working with someone', emoji: '✅' }
];

export default function FindExpertForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    painPoints: [],
    duration: '',
    previousHelp: '',
    fullName: '',
    email: '',
    mobile: '',
    age: ''
  });

  const totalSteps = 4;

  const handlePainPointToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(id)
        ? prev.painPoints.filter(p => p !== id)
        : [...prev.painPoints, id]
    }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && formData.painPoints.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    if (currentStep === 2 && !formData.duration) {
      toast.error('Please select a duration');
      return;
    }
    if (currentStep === 3 && !formData.previousHelp) {
      toast.error('Please select an option');
      return;
    }
    if (currentStep === 4) {
      handleSubmit();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Validate final step
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/clarity-call-request`,
        {
          painPoints: formData.painPoints,
          duration: formData.duration,
          previousHelp: formData.previousHelp,
          name: formData.fullName,
          email: formData.email,
          phone: formData.mobile.replace('+', ''),
          age: formData.age
        }
      );

      if (response.data.r === 's') {
        setCurrentStep(5); // Show thank you screen
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting clarity call request:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.painPoints.length > 0;
      case 2: return !!formData.duration;
      case 3: return !!formData.previousHelp;
      case 4: return !!(formData.fullName && formData.email && formData.mobile && formData.age);
      default: return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Pain Points */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
                  <div className="flex gap-1">
                    {[...Array(totalSteps)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-8 rounded-full ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  What would you like to work on?
                </h2>
                <p className="text-gray-600">Select all that apply</p>
              </div>

              <div className="space-y-3 mb-8">
                {PAIN_POINTS.map(option => {
                  const Icon = option.icon;
                  const isSelected = formData.painPoints.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handlePainPointToggle(option.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center text-white flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-left font-medium text-gray-900 flex-1">{option.label}</span>
                      {isSelected && (
                        <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Duration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handleBack} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
                  <div className="flex gap-1">
                    {[...Array(totalSteps)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-8 rounded-full ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  How long have you been experiencing this?
                </h2>
                <p className="text-gray-600">This helps us understand your situation better</p>
              </div>

              <div className="space-y-3 mb-8">
                {DURATION_OPTIONS.map(option => {
                  const isSelected = formData.duration === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setFormData(prev => ({ ...prev, duration: option.id }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                      <span className="text-left font-medium text-gray-900 flex-1">{option.label}</span>
                      {isSelected && (
                        <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 3: Previous Help */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handleBack} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
                  <div className="flex gap-1">
                    {[...Array(totalSteps)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-8 rounded-full ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Have you tried professional help before?
                </h2>
                <p className="text-gray-600">Your experience helps us guide you better</p>
              </div>

              <div className="space-y-3 mb-8">
                {PREVIOUS_HELP_OPTIONS.map(option => {
                  const isSelected = formData.previousHelp === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setFormData(prev => ({ ...prev, previousHelp: option.id }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                      <span className="text-left font-medium text-gray-900 flex-1">{option.label}</span>
                      {isSelected && (
                        <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 4: Personal Info */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handleBack} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
                  <div className="flex gap-1">
                    {[...Array(totalSteps)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-8 rounded-full ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Let's get to know you
                </h2>
                <p className="text-gray-600">We'll use this to match you with the right expert</p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="p-3 text-base"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="p-3 text-base"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={formData.mobile}
                    onChange={(value) => setFormData(prev => ({ ...prev, mobile: value || '' }))}
                    className="w-full p-3 rounded-md border border-gray-300 shadow-sm"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                    className="p-3 text-base"
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 5: Thank You */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            >
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Thank You! 🎉
                </h2>
                <p className="text-lg text-gray-700 mb-2">
                  We've received your request
                </p>
                <p className="text-gray-600 max-w-md mx-auto">
                  Our team will reach out to you within 24 hours to schedule your complimentary clarity call with the most relevant expert for your needs.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium">
                  💡 What to expect next:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 text-left">
                  <li>✓ A call from our team within 24 hours</li>
                  <li>✓ 15-minute clarity call with a specialist</li>
                  <li>✓ Personalized expert recommendations</li>
                  <li>✓ Guidance on next steps</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1 py-6 text-base"
                >
                  Back to Home
                </Button>
                <Button
                  onClick={() => router.push('/mind')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-base"
                >
                  Explore Experts
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

