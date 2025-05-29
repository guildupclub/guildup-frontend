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
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categorys?.map((cat: Category) => (
          <div key={cat._id} className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => handleCategorySelect(cat._id)}
              className={`px-5 py-3 rounded-xl text-sm transition-all
                relative group snap-center
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
              <span className="relative z-10 whitespace-nowrap">{cat.name}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
