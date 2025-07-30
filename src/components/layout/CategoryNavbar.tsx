"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
}

interface CategoryNavbarProps {
  categories?: Category[];
  activeCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function CategoryNavbar({ 
  categories = [], 
  activeCategory = 'All Category',
  onCategorySelect 
}: CategoryNavbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-start md:justify-center space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide category-navbar-mobile" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onCategorySelect?.(category._id)}
              className={cn(
                "whitespace-nowrap pb-2 text-sm font-medium transition-all duration-200 flex-shrink-0 relative min-w-fit",
                activeCategory === category.name
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {category.name}
              {activeCategory === category.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 