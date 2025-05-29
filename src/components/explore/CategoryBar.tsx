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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 rounded-lg">
        {categorys?.map((cat: Category) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 flex-shrink-0 border
              ${
                selectedCategoryId === cat._id
                  ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:text-primary"
              }
            `}
          >
            <span className="whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
