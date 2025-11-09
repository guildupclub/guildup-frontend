"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveInquiry } from "@/lib/services/diagnosticLeads";
import { AnimatePresence, motion } from "framer-motion";
import { primary } from "@/app/colours";
import Loader from "@/components/Loader";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";

interface NeedHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogStep = 'welcome' | 'contact' | 'confirmation';

export default function NeedHelpDialog({ open, onOpenChange }: NeedHelpDialogProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const [currentStep, setCurrentStep] = useState<DialogStep>('welcome');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '+91',
    email: '',
    concerns: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');

  const canSubmitContact = useMemo(() => {
    const phone = contactInfo.phone.trim();
    // Phone must be exactly +91 followed by 10 digits (total 13 characters)
    const isValidPhone = phone.startsWith('+91') && phone.length === 13 && /^\+91\d{10}$/.test(phone);
    return contactInfo.name.trim() !== '' && isValidPhone;
  }, [contactInfo]);

  const handlePhoneChange = (value: string) => {
    // Only allow +91 prefix
    if (value === '' || value === '+') {
      setContactInfo(prev => ({ ...prev, phone: '+91' }));
      setPhoneError('');
      return;
    }
    
    if (!value.startsWith('+91')) {
      setPhoneError('Phone number must start with +91');
      return;
    }
    
    // Only allow digits after +91
    const digitsOnly = value.replace(/[^0-9+]/g, '');
    if (digitsOnly.startsWith('+91')) {
      const phoneNumber = digitsOnly.substring(3); // Remove +91
      // Limit to 10 digits after +91
      if (phoneNumber.length <= 10) {
        setContactInfo(prev => ({ ...prev, phone: '+91' + phoneNumber }));
        setPhoneError('');
      }
    }
  };

  const handleContactSubmit = async () => {
    if (!canSubmitContact) {
      if (!contactInfo.phone.trim().startsWith('+91')) {
        setPhoneError('Phone number must start with +91');
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      const inquiryData = {
        name: contactInfo.name.trim(),
        phone: contactInfo.phone.trim(),
        email: contactInfo.email.trim() || undefined,
        concerns: contactInfo.concerns.trim() || undefined,
        userId
      };

      console.log('Submitting inquiry data:', {
        name: inquiryData.name,
        phone: inquiryData.phone,
        hasEmail: !!inquiryData.email,
        hasConcerns: !!inquiryData.concerns,
        userId: inquiryData.userId
      });

      const docId = await saveInquiry(inquiryData);
      console.log('✅ Inquiry submitted successfully, document ID:', docId);
      setSubmissionId(docId);
      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('❌ Error submitting inquiry:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      
      // If it's a database storage error, redirect to WhatsApp
      if (error?.code === 'permission-denied' || error?.code === 'unavailable' || error?.code === 'failed-precondition' || error?.message?.includes('Firebase')) {
        // Create WhatsApp message with inquiry details
        const whatsappMessage = encodeURIComponent(
          `Hi! I need help.\n\n` +
          `Name: ${inquiryData.name}\n` +
          `Phone: ${inquiryData.phone}\n` +
          (inquiryData.email ? `Email: ${inquiryData.email}\n` : '') +
          (inquiryData.concerns ? `Concerns: ${inquiryData.concerns}` : '')
        );
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${whatsappMessage}`;
        
        // Show alert and redirect to WhatsApp
        alert('We encountered an issue saving your information. Redirecting you to WhatsApp so we can help you directly.');
        window.open(whatsappUrl, '_blank');
        
        // Close the dialog
        handleClose();
      } else {
        // For other errors, show alert
        alert(`Failed to save your information: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setCurrentStep('welcome');
    setContactInfo({ name: '', phone: '+91', email: '', concerns: '' });
    setIsSubmitting(false);
    setSubmissionId(null);
    setPhoneError('');
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        fixed 
        top-0 
        right-0 
        h-full 
        w-full 
        max-w-md 
        md:max-w-lg 
        lg:max-w-xl 
        max-h-full 
        overflow-y-auto 
        md:rounded-l-2xl 
        md:rounded-r-none 
        rounded-t-2xl
        rounded-b-none
        md:top-4 
        md:right-4 
        md:h-[calc(100vh-2rem)]
        transform 
        md:translate-x-0 
        translate-y-full 
        md:translate-y-0
        transition-transform 
        duration-300 
        ease-in-out
        data-[state=open]:translate-y-0
        md:data-[state=open]:translate-x-0
        z-50
        shadow-2xl
        border-0
        md:border-l
        md:border-gray-200
        bg-white
        flex
        flex-col
      " style={{ fontFamily: "'Poppins', sans-serif" }}>
        <DialogHeader className="sticky top-0 bg-white z-10 border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold" style={{ color: primary }}>
            {currentStep === 'welcome' && 'Need Help?'}
            {currentStep === 'contact' && 'Contact Information'}
            {currentStep === 'confirmation' && 'Thank You'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <AnimatePresence mode="wait">
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-600">
                  We&apos;re here to help. Please share your contact information and concerns, and our experts will reach out to you.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your contact information</li>
                    <li>• Tell us about your concerns</li>
                    <li>• Our experts will reach out to you within 24 hours</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep('contact')} style={{ backgroundColor: primary }}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-600">
                  Please provide your contact information so our experts can reach out to you.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+91"
                      className="mt-1"
                      required
                    />
                    {phoneError && (
                      <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                    )}
                    {!phoneError && contactInfo.phone && !contactInfo.phone.startsWith('+91') && (
                      <p className="text-sm text-red-600 mt-1">Phone number must start with +91</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Your email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="concerns">Your Concerns (Optional)</Label>
                    <Textarea
                      id="concerns"
                      value={contactInfo.concerns}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, concerns: e.target.value }))}
                      placeholder="Tell us about your concerns or what you'd like help with..."
                      className="mt-1 min-h-[100px]"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('welcome')}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleContactSubmit}
                    disabled={!canSubmitContact || isSubmitting}
                    style={{ backgroundColor: primary }}
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Reaching Out</h3>
                    <p className="text-gray-600 mb-4">
                      We've received your information. Our experts will reach out to you within 24 hours to help you on your journey.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Our team will review your information</li>
                      <li>• We&apos;ll match you with the most suitable expert</li>
                      <li>• You&apos;ll receive a call or message within 24 hours</li>
                      <li>• Your expert will reach out to schedule a consultation</li>
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleClose} style={{ backgroundColor: primary }}>
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
