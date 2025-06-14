"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (app is installed)
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Check for navigator.standalone (iOS Safari)
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    if (checkIfInstalled()) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setCanInstall(false);
      toast.success('GuildUp app installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not available');
      return false;
    }

    setIsInstalling(true);
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        toast.success('Installing GuildUp app...');
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        toast.info('You can install the app later from your browser menu');
        return false;
      }
      
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      toast.error('Installation failed. Please try again.');
      return false;
    } finally {
      setIsInstalling(false);
      // Clear the deferredPrompt regardless of outcome
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  return {
    canInstall,
    isInstalled,
    isInstalling,
    installApp
  };
};

export default usePWAInstall; 