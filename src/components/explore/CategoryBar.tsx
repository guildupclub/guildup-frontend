import React, { useState } from "react";

interface Category {
  name: string;
  _id: string;
}

interface CategoryBarProps {
  categorys: Category[];
  selectCategory: (a: string) => void;
}

function CategoryBar({ categorys, selectCategory }: CategoryBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id); // Update the selected category state
    selectCategory(id); // Call the parent function
  };

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-20 text-white overflow-auto scrollbar-none cursor-pointer pb-4">
      <div className="flex gap-4">
        {categorys?.map((cat: Category) => (
          <button
            className={`text-md cursor-pointer font-semibold flex-shrink-0 ${
              selectedCategory === cat._id
                ? "text-gradient"
                : "hover:text-gradient"
            }`}
            onClick={() => handleCategorySelect(cat._id)}
            key={cat._id}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
