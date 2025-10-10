"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PHQ9 } from "@/lib/assessments/phq9";
import { computePhq9Score } from "@/lib/assessments/scoring";
import { saveDiagnosticLead } from "@/lib/services/diagnosticLeads";
import { AnimatePresence, motion } from "framer-motion";
import { primary } from "@/app/colours";
import Loader from "@/components/Loader";

type AnswerMap = Record<string, string>;

interface NeedHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogStep = 'welcome' | 'questions' | 'contact' | 'recommendations' | 'confirmation';

export default function NeedHelpDialog({ open, onOpenChange }: NeedHelpDialogProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const [currentStep, setCurrentStep] = useState<DialogStep>('welcome');
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const questions = useMemo(() => PHQ9.questions.map((q) => ({ id: String(q.id), text: q.text })), []);

  const score = useMemo(() => {
    if (Object.keys(answers).length !== questions.length) return null;
    const numericAnswers = Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [Number(k), Number(v) as 0 | 1 | 2 | 3])
    );
    return computePhq9Score(numericAnswers as any);
  }, [answers, questions.length]);

  const suicidality = useMemo(() => (score?.labels || []).includes("suicidality_risk"), [score?.labels]);

  const canSubmitContact = useMemo(() => {
    return contactInfo.name.trim() !== '' && contactInfo.phone.trim() !== '';
  }, [contactInfo]);

  const handleAnswerChange = (questionId: string, value: string) => {
    const answerText = PHQ9.response_scale[Number(value) as keyof typeof PHQ9.response_scale];
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance to next question or contact form
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 200);
    } else {
      setTimeout(() => setCurrentStep('contact'), 200);
    }
  };

  const handleContactSubmit = async () => {
    if (!canSubmitContact || !score) return;
    
    setIsSubmitting(true);
    try {
      const submissionData = {
        name: contactInfo.name.trim(),
        phone: contactInfo.phone.trim(),
        email: contactInfo.email.trim() || undefined,
        responses: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [
            k, 
            {
              value: Number(v),
              text: PHQ9.response_scale[Number(v) as keyof typeof PHQ9.response_scale]
            }
          ])
        ),
        score: score.total,
        level: score.level,
        userId
      };

      const docId = await saveDiagnosticLead(submissionData);
      setSubmissionId(docId);
      setCurrentStep('recommendations');
    } catch (error) {
      console.error('Error submitting diagnostic lead:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfirmationMessage = () => {
    if (!score) return '';
    
    const level = score.level.toLowerCase();
    const hasRisk = suicidality;
    
    if (hasRisk) {
      return {
        title: "Thank you for reaching out",
        message: "Your well-being matters deeply to us. We've connected you with experienced professionals who can provide the support you need. If you're experiencing thoughts of self-harm, please seek immediate help from local emergency services or a crisis helpline.",
        nextSteps: [
          "Our recommended experts will reach out to you within 24 hours",
          "Consider reaching out to a trusted friend or family member",
          "Keep emergency contacts readily available"
        ]
      };
    }
    
    if (level.includes('severe')) {
      return {
        title: "Thank you for sharing",
        message: "We understand this is a challenging time, and we're here to support you. Our recommended experts specialize in helping people through similar experiences.",
        nextSteps: [
          "Our experts will contact you within 24 hours",
          "Consider involving a trusted support person",
          "Take things one day at a time"
        ]
      };
    }
    
    if (level.includes('moderate')) {
      return {
        title: "Thank you for taking this step",
        message: "It takes courage to seek help, and we're proud of you for reaching out. Our recommended experts can help you develop effective coping strategies.",
        nextSteps: [
          "Our experts will reach out within 24-48 hours",
          "Consider starting with a brief consultation",
          "Remember that seeking help is a sign of strength"
        ]
      };
    }
    
    return {
      title: "Thank you for your honesty",
      message: "Even mild symptoms deserve attention and care. Our recommended experts can help you maintain your well-being and prevent symptoms from worsening.",
      nextSteps: [
        "Our experts will contact you within 48 hours",
        "Consider this a preventive measure for your mental health",
        "Continue monitoring your well-being"
      ]
    };
  };

  const resetDialog = () => {
    setCurrentStep('welcome');
    setAnswers({});
    setCurrentQuestionIndex(0);
    setContactInfo({ name: '', phone: '', email: '' });
    setIsSubmitting(false);
    setSubmissionId(null);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

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
        <DialogHeader className="sticky top-0 bg-white z-10 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold" style={{ color: primary }}>
            {currentStep === 'welcome' && 'Need Help?'}
            {currentStep === 'questions' && 'Quick Well-being Check'}
            {currentStep === 'contact' && 'Contact Information'}
            {currentStep === 'recommendations' && 'Expert Recommendations'}
            {currentStep === 'confirmation' && 'Thank You'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
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
                  We&apos;re here to help. This quick assessment will help us connect you with the right mental health professionals.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 9 quick questions (about 2 minutes)</li>
                    <li>• Share your contact information</li>
                    <li>• Get personalized expert recommendations</li>
                    <li>• Experts will reach out to you directly</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep('questions')} style={{ backgroundColor: primary }}>
                    Start Assessment
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'questions' && currentQuestion && (
              <motion.div
                key={`question-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Progress bar */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%`,
                        backgroundColor: primary
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white">
                  <label className="block text-lg font-medium mb-4 text-gray-900">
                    {currentQuestion.text}
                  </label>
                  <RadioGroup
                    value={answers[currentQuestion.id] ?? ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="grid gap-3"
                  >
                    {Object.entries(PHQ9.response_scale).map(([value, label]) => (
                      <Label
                        key={value}
                        className={`cursor-pointer text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          answers[currentQuestion.id] === value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value={value} />
                        <span className="text-sm text-gray-800 flex-1">{label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Back
                  </Button>
                  <div className="text-xs text-gray-500">
                    Tap an option to continue
                  </div>
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                      className="mt-1"
                    />
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
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('questions')}
                  >
                    Back to Questions
                  </Button>
                  <Button
                    onClick={handleContactSubmit}
                    disabled={!canSubmitContact || isSubmitting}
                    style={{ backgroundColor: primary }}
                  >
                    {isSubmitting ? 'Saving...' : 'Get Recommendations'}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {score && (
                  <div className="p-4 rounded-lg border bg-white mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Your Assessment Score</div>
                        <div className="text-xl font-semibold">
                          {score.total} ({score.level})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-6 py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Sharing</h3>
                    <p className="text-gray-600 text-lg">
                      We will shortly contact you with the perfect coach/expert for your needs.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Our team will review your assessment</li>
                      <li>• We&apos;ll match you with the most suitable expert</li>
                      <li>• You&apos;ll receive a call or message within 24 hours</li>
                      <li>• Your expert will reach out to schedule a consultation</li>
                    </ul>
                  </div>

                  {suicidality && (
                    <div className="bg-red-50 p-4 rounded-lg text-left">
                      <h4 className="font-medium text-red-900 mb-2">Important:</h4>
                      <p className="text-sm text-red-800">
                        If you&apos;re experiencing thoughts of self-harm, please seek immediate help from local emergency services or a crisis helpline.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep('confirmation')}
                    style={{ backgroundColor: primary }}
                  >
                    Continue
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
                {(() => {
                  const confirmation = getConfirmationMessage();
                  return (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{confirmation.title}</h3>
                        <p className="text-gray-600 mb-4">{confirmation.message}</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg text-left">
                        <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {confirmation.nextSteps.map((step, index) => (
                            <li key={index}>• {step}</li>
                          ))}
                        </ul>
                      </div>

                      {suicidality && (
                        <div className="bg-red-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-red-900 mb-2">Important:</h4>
                          <p className="text-sm text-red-800">
                            If you&apos;re experiencing thoughts of self-harm, please seek immediate help from local emergency services or a crisis helpline.
                          </p>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Button onClick={handleClose} style={{ backgroundColor: primary }}>
                          Close
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
