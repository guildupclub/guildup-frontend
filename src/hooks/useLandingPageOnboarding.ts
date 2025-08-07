import { useState, useEffect, useCallback } from 'react';

interface UseLandingPageOnboardingProps {
  variant: 'mind' | 'body';
  delay?: number; // Delay in milliseconds before showing popup
  onComplete?: (data: any) => void;
}

export function useLandingPageOnboarding({ 
  variant, 
  delay = 2500, // Default 2.5 seconds
  onComplete 
}: UseLandingPageOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Check if user has already dismissed or completed onboarding
  const getOnboardingStatus = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const key = `onboarding-${variant}-dismissed`;
    const dismissed = localStorage.getItem(key);
    const completed = localStorage.getItem(`onboarding-${variant}-completed`);
    
    return { dismissed: !!dismissed, completed: !!completed };
  }, [variant]);

  // Mark onboarding as dismissed
  const markAsDismissed = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const key = `onboarding-${variant}-dismissed`;
    localStorage.setItem(key, new Date().toISOString());
  }, [variant]);

  // Mark onboarding as completed
  const markAsCompleted = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const key = `onboarding-${variant}-completed`;
    localStorage.setItem(key, new Date().toISOString());
  }, [variant]);

  // Auto-trigger popup after delay
  useEffect(() => {
    if (hasShown) return;

    const status = getOnboardingStatus();
    if (status?.dismissed || status?.completed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, hasShown, getOnboardingStatus]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
    markAsDismissed();
  }, [markAsDismissed]);

  // Handle complete
  const handleComplete = useCallback((data: any) => {
    setIsOpen(false);
    markAsCompleted();
    if (onComplete) {
      onComplete(data);
    }
  }, [markAsCompleted, onComplete]);

  // Manual trigger
  const triggerOnboarding = useCallback(() => {
    setIsOpen(true);
    setHasShown(true);
  }, []);

  // Reset onboarding status (for testing or admin purposes)
  const resetOnboardingStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(`onboarding-${variant}-dismissed`);
    localStorage.removeItem(`onboarding-${variant}-completed`);
    setHasShown(false);
  }, [variant]);

  return {
    isOpen,
    handleClose,
    handleComplete,
    triggerOnboarding,
    resetOnboardingStatus,
    hasShown
  };
} 