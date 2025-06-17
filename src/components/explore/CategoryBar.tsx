import React, { useState } from "react";
import { Button } from "../ui/button";

interface Category {
  name: string;
  _id: string;
}

interface CategoryBarProps {
  categorys: Category[];
  selectCategory: (a: string) => void;
  selectedCategoryId?: string;
}

function CategoryBar({
  categorys,
  selectCategory,
  selectedCategoryId,
}: CategoryBarProps) {
  const handleCategorySelect = (id: string) => {
    selectCategory(id); // Call the parent function
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block max-h-[480px] overflow-y-auto scrollbar-none space-y-2">
        {categorys?.map((cat: Category) => (
          <div key={cat._id}>
            <Button
              variant="outline"
              onClick={() => handleCategorySelect(cat._id)}
              className={`w-full text-left px-5 py-3 rounded-xl text-sm transition-all duration-300 
          relative group 
          ${
            selectedCategoryId === cat._id
              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold border-primary/20"
              : "hover:bg-white/10 text-gray-600 hover:text-gray-800 hover:border-gray-50"
          }
          before:absolute before:inset-0 before:rounded-xl before:border before:border-gray-200/30 
          before:transition-all before:duration-300
          hover:before:scale-95 hover:before:opacity-0
          after:absolute after:inset-0 after:rounded-xl after:border after:border-primary/30
          after:scale-90 after:opacity-0 after:transition-all after:duration-300
          hover:after:scale-100 hover:after:opacity-100
        `}
            >
              <span className="relative z-10">{cat.name}</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Mobile View - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto scrollbar-none pb-1">
        <div className="flex gap-2 py-1 w-max">
          {categorys?.map((cat: Category) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat._id)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 flex-shrink-0
                relative group
                ${
                  selectedCategoryId === cat._id
                    ? "bg-primary text-white font-medium"
                    : "bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-100"
                }
              `}
            >
              <span className="relative z-10 whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryBar;
