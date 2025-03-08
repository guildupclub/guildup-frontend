import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

interface Category {
  name: string;
  _id: string;
}

interface CategoryBarProps {
  categorys: Category[];
  selectCategory: (a: string) => void;
}

function CategoryBar({ categorys, selectCategory }: CategoryBarProps) {
  // Initialize the selected category with the first category's ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categorys.length > 0 ? categorys[0]._id : null
  );

  // On component mount, select the first category by default
  useEffect(() => {
    if (categorys.length > 0) {
      setSelectedCategory(categorys[0]._id);
    }
  }, [categorys, selectCategory]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id); // Update the selected category state
    selectCategory(id); // Call the parent function
  };

  return (
    <>
      {/* Desktop View (md and larger) */}
      <div className="hidden md:block !bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-20 overflow-scroll scrollbar-none cursor-pointer lg:px-[100px]">
        <div className="flex gap-4">
          {categorys?.map((cat: Category) => (
            <button
              className={`text-md cursor-pointer font-semibold flex-shrink-0 ${
                selectedCategory === cat._id
                  ? "text-gradient underline underline-offset-4 decoration-blue-500"
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

      {/* Mobile View */}
      <div className="md:hidden overflow-x-scroll scrollbar-none whitespace-nowrap backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-20">
        <div className="flex gap-2 px-4">
          {categorys?.map((cat: Category) => (
            <button
              className={`bg-card py-1 px-2.5 rounded-lg text-md cursor-pointer font-semibold flex-shrink-0 ${
                selectedCategory === cat._id
                  ? "text-gradient underline underline-offset-4 decoration-blue-500"
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
    </>
  );
}

export default CategoryBar;
