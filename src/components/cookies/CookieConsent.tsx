'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Cookie, Shield, BarChart3, Users } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  enabled: boolean;
}

export default function CookieConsent() {
  const { showConsent, acceptAll, acceptSelected, rejectAll, closeBanner } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>([
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      icon: <Shield className="w-4 h-4" />,
      required: true,
      enabled: true,
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      icon: <Cookie className="w-4 h-4" />,
      required: false,
      enabled: true,
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      icon: <BarChart3 className="w-4 h-4" />,
      required: false,
      enabled: true,
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to track visitors across websites for advertising purposes.',
      icon: <Users className="w-4 h-4" />,
      required: false,
      enabled: false,
    },
  ]);

  if (!showConsent) return null;

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId && !cat.required
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const handleAcceptSelected = () => {
    const selectedCategories = categories
      .filter(cat => cat.enabled)
      .map(cat => cat.id);
    acceptSelected(selectedCategories);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              <CardTitle>Cookie Preferences</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeBanner}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showDetails ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={acceptAll}
                className="flex-1"
              >
                Accept All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetails(true)}
                className="flex-1"
              >
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={rejectAll}
                className="flex-1"
              >
                Reject All
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {category.icon}
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {category.required ? (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            Required
                          </span>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={category.enabled}
                              onChange={() => handleCategoryToggle(category.id)}
                            />
                            <div className={`w-11 h-6 rounded-full ${
                              category.enabled ? 'bg-primary' : 'bg-gray-200'
                            } relative transition-colors`}>
                              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                category.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptSelected}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            You can change these settings at any time in your{' '}
            <button className="underline hover:text-primary">
              Privacy Settings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 