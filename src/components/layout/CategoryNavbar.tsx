"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categories = [
  'Fitness & Yoga',
  'Nutrition and Diet', 
  'Relationship and Parenting',
  'Mental Health',
  'Personal Growth',
  'Others'
];

export function CategoryNavbar() {
  const [activeCategory, setActiveCategory] = useState('Fitness & Yoga');

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-center space-x-8 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "whitespace-nowrap pb-2 text-sm font-medium transition-all duration-200 flex-shrink-0 relative",
                activeCategory === category
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {category}
              {activeCategory === category && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 