"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Category {
  name: string
  _id: string
}

interface CategoryBarProps {
  categorys: Category[]
  selectCategory: (a: string) => void
}

function CategoryBar({ categorys, selectCategory }: CategoryBarProps) {
  const router = useRouter()

  // Initialize the selected category with the first category's ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categorys.length > 0 ? categorys[0]._id : null,
  )

  // On component mount, select the first category by default
  useEffect(() => {
    if (categorys.length > 0) {
      setSelectedCategory(categorys[0]._id)
      selectCategory(categorys[0]._id)
    }
  }, [categorys, selectCategory])

  const handleCategorySelect = (id: string, name: string) => {
    setSelectedCategory(id) // Update the selected category state
    selectCategory(id) // Call the parent function

    // Redirect to the category page with both name and ID
    router.push(`/explore/${encodeURIComponent(name)}?id=${id}`)
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block max-h-[480px] overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-3">
          {categorys?.map((cat: Category) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat._id, cat.name)}
              className={`text-left px-5 py-3 rounded-xl text-sm transition-all duration-300 
                relative group   border-b-2
                ${
                  selectedCategory === cat._id
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold border-primary/20"
                    : "hover:bg-white/10 text-gray-600 hover:text-gray-800 hover:border-gray-200"
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
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto scrollbar-none pb-1">
        <div className="flex gap-2 py-1 w-max">
          {categorys?.map((cat: Category) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat._id, cat.name)}
              className={`px-5 py-3 rounded-xl text-sm transition-all duration-300 flex-shrink-0
                relative group border border-transparent
                ${
                  selectedCategoryId === cat._id
                    ? "bg-primary text-white font-medium"
                    : "bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-100"
                }
              `}
            >
              <span className="relative z-10 whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryBar
