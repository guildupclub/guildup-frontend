"use client";

import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-2 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center justify-center flex-1">
          <span className="text-xs md:text-sm font-medium text-center text-blue-600">
            🎯 GuildUp Spotlight Campaign Launching Soon — Only 25 Experts Will Be Featured!
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <a 
            href="#"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm underline flex items-center transition-colors"
          >
            Get Started
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-blue-100 rounded transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 