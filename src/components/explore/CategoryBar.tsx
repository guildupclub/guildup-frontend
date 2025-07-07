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
    selectCategory(id);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {categorys?.map((cat: Category) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat._id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 border border-white/20 backdrop-blur-sm relative overflow-hidden group
              ${
                selectedCategoryId === cat._id
                  ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-600/20 border-blue-400/30"
                  : "bg-white/60 text-gray-700 hover:bg-white/80 hover:border-blue-200/50 hover:shadow-md hover:shadow-blue-100/30 shadow-sm"
              }
            `}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glass border highlight */}
            <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
              selectedCategoryId === cat._id 
                ? "border-blue-300/40" 
                : "border-white/30 group-hover:border-white/50"
            }`} />
            
            <span className="relative whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
