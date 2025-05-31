"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-center">Filter by Topic</h3>
      
      {/* Desktop Filter */}
      <div className="hidden md:flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className={`transition-all duration-200 ${
              selectedCategory === category.id 
                ? 'bg-blue-600 text-white shadow-lg scale-105 hover:bg-blue-700 hover:text-white' 
                : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:scale-105'
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Mobile Filter - Horizontal Scroll */}
      <div className="md:hidden">
        <div 
          className="flex gap-3 overflow-x-auto pb-2 px-4 -mx-4"
          style={{
            /* Hide scrollbar for Chrome, Safari and Opera */
            WebkitScrollbar: 'none',
            /* Hide scrollbar for IE, Edge and Firefox */
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          } as React.CSSProperties}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 transition-all duration-200 ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' 
                  : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
              }`}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedCategory !== 'all' && (
        <div className="flex justify-center mt-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <span>Filtered by:</span>
            <span className="font-medium">
              {categories.find(cat => cat.id === selectedCategory)?.name}
            </span>
            <button
              onClick={() => onCategoryChange('all')}
              className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
} 