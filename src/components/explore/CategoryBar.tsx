import React, { useState, useEffect } from "react";

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
      selectCategory(categorys[0]._id);
    }
  }, [categorys, selectCategory]);


  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id); // Update the selected category state
    selectCategory(id); // Call the parent function
  };

  return (
    <div className="!bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-20 overflow-auto scrollbar-none cursor-pointer">
      <div className="flex gap-4 px-4">
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
  );
}

export default CategoryBar;
