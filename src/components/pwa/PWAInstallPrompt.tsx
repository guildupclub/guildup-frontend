"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Smartphone, CheckCircle, Wifi } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallPromptProps {
  showOnLoad?: boolean;
  className?: string;
  mode?: 'subtle' | 'full' | 'icon-only';
  hideOnMobile?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  showOnLoad = true, 
  className = "",
  mode = 'subtle',
  hideOnMobile = false
}) => {
  const { canInstall, isInstalled, isInstalling, installApp } = usePWAInstall();
  const [showDialog, setShowDialog] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(true);

  // Show button immediately on mobile, short loading on desktop
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const timeout = isMobile ? 500 : 2000; // 0.5s on mobile, 2s on desktop
    
    const timer = setTimeout(() => {
      setShowLoadingState(false);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-show dialog when PWA becomes installable
  useEffect(() => {
    if (canInstall && showOnLoad) {
      // Check if user has already dismissed the prompt in this session
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          setShowDialog(true);
        }, 5000); // Show after 5 seconds to be less intrusive
      }
    }
  }, [canInstall, showOnLoad]);

  const handleInstallClick = async () => {
    if (!canInstall) {
      // Fallback for when PWA isn't available - show install instructions
      setShowDialog(true);
      return;
    }
    const success = await installApp();
    if (success) {
      setShowDialog(false);
    }
  };

  const handleDismiss = () => {
    setShowDialog(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't render anything if app is already installed
  if (isInstalled) {
    return null;
  }

  // Render different button styles based on mode
  const renderButton = () => {
    if (mode === 'icon-only') {
      return (
        <Button
          onClick={() => setShowDialog(true)}
          variant="ghost"
          size="sm"
          className={`p-2 text-gray-500 hover:text-gray-700 ${hideOnMobile ? 'hidden md:flex' : ''} ${className}`}
          title="Install GuildUp App"
        >
          <Download className="h-4 w-4" />
        </Button>
      );
    }

    if (mode === 'full') {
      return (
        <Button
          onClick={() => canInstall ? setShowDialog(true) : handleInstallClick()}
          variant="outline"
          size="sm"
          disabled={isInstalling || showLoadingState}
          className={`flex items-center gap-2 ${hideOnMobile ? 'hidden md:flex' : ''} ${className}`}
          title={canInstall ? "Install GuildUp App" : "Install GuildUp App"}
        >
          {isInstalling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              <span>Installing...</span>
            </>
          ) : showLoadingState ? (
            <>
              <div className="animate-pulse h-4 w-4 bg-current rounded opacity-50" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Install App</span>
            </>
          )}
        </Button>
      );
    }

    // Default subtle mode
    return (
      <Button
        onClick={() => setShowDialog(true)}
        variant="ghost"
        size="sm"
        className={`flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 h-auto ${hideOnMobile ? 'hidden md:flex' : ''} ${className}`}
        title="Install GuildUp App"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden xl:inline text-xs">Install</span>
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Installation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Install GuildUp App</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Get the full app experience
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Why install the app?</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Faster access from your home screen</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Wifi className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>Works offline for better performance</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span>Native app-like experience</span>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">How it works:</p>
              <p className="text-xs text-gray-500">
                Click "Install" below and the app will be added to your device. 
                You can uninstall it anytime from your device settings.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {canInstall ? (
                <Button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    Add GuildUp to your home screen for quick access:
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Chrome/Android:</strong> Menu → "Add to Home screen"</p>
                    <p><strong>Safari/iOS:</strong> Share → "Add to Home Screen"</p>
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-4"
              >
                {canInstall ? "Maybe Later" : "Got it"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAInstallPrompt; 