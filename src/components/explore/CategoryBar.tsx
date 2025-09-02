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
    <nav className="w-full" aria-label="Category navigation">
      <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
        {categorys?.map((cat: Category) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat._id)}
            aria-current={selectedCategoryId === cat._id ? "page" : undefined}
            className={`pb-2 -mb-px whitespace-nowrap text-sm font-medium flex-shrink-0 border-b-2 transition-colors duration-200
              ${
                selectedCategoryId === cat._id
                  ? "text-indigo-700 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900 border-transparent"
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CategoryBar;
