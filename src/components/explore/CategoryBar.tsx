import React, { useState } from "react";
import { Button } from "../ui/button";
import { 
  Heart, 
  Dumbbell, 
  Apple, 
  Users, 
  Brain, 
  TrendingUp, 
  Star,
  Target,
  Zap,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Activity,
  Coffee,
  BookOpen,
  Lightbulb,
  Smile,
  Home,
  Briefcase,
  Leaf,
  MessageCircle,
  Flame,
  Gem,
  HeartHandshake,
  Baby,
  Crown,
  Sparkles as SparklesIcon
} from "lucide-react";

interface Category {
  name: string;
  _id: string;
}

interface CategoryBarProps {
  categorys: Category[];
  selectCategory: (a: string) => void;
  selectedCategoryId?: string;
  selectSubCategory?: (subCategory: string) => void;
  selectedSubCategory?: string;
}

// Category icons mapping with more relatable icons
const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    "All Category": <Star className="w-4 h-4" />,
    "Mental Health and Counselling": <Brain className="w-4 h-4" />,
    "Fitness and Yoga": <Dumbbell className="w-4 h-4" />,
    "Nutrition and Diet": <Apple className="w-4 h-4" />,
    "Relationship and Parenting": <HeartHandshake className="w-4 h-4" />,
    "Self improvement & growth": <Leaf className="w-4 h-4" />,
    "Others": <SparklesIcon className="w-4 h-4" />,
  };
  return iconMap[categoryName] || <Star className="w-4 h-4" />;
};

// Subcategory icons mapping with emoji-style icons
const getSubCategoryIcon = (subCategory: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    // Fitness and Yoga
    "Weight loss": <Flame className="w-3 h-3" />,
    "Strength training": <Zap className="w-3 h-3" />,
    "PCOS": <Heart className="w-3 h-3" />,
    "Back pain": <Activity className="w-3 h-3" />,
    "Flexibility": <Sparkles className="w-3 h-3" />,
    "Ashtanga": <Sun className="w-3 h-3" />,
    "Prenatal": <Baby className="w-3 h-3" />,
    
    // Nutrition and Diet
    "Weight gain": <TrendingUp className="w-3 h-3" />,
    "Skin": <Gem className="w-3 h-3" />,
    "Immunity": <Shield className="w-3 h-3" />,
    "Gut health": <Heart className="w-3 h-3" />,
    "Thyroid": <Activity className="w-3 h-3" />,
    "Diabetes": <Target className="w-3 h-3" />,
    "Hormonal": <Zap className="w-3 h-3" />,
    
    // Relationship and Parenting
    "Breakups": <Heart className="w-3 h-3" />,
    "Dating": <Sparkles className="w-3 h-3" />,
    "Marriage": <Home className="w-3 h-3" />,
    "Parenting": <Baby className="w-3 h-3" />,
    "Communication": <MessageCircle className="w-3 h-3" />,
    "Conflict": <Shield className="w-3 h-3" />,
    
    // Self improvement & growth
    "Confidence": <Crown className="w-3 h-3" />,
    "Energy": <Zap className="w-3 h-3" />,
    "Healing": <Heart className="w-3 h-3" />,
    "Self-worth": <Gem className="w-3 h-3" />,
    "Self-love": <Heart className="w-3 h-3" />,
    
    // Mental Health and Counselling
    "Anxiety": <Brain className="w-3 h-3" />,
    "Depression": <Moon className="w-3 h-3" />,
    "Trauma": <Shield className="w-3 h-3" />,
    "Burnout": <Coffee className="w-3 h-3" />,
    "Stress": <Activity className="w-3 h-3" />,
    "Anger": <Zap className="w-3 h-3" />,
    "Overthinking": <Lightbulb className="w-3 h-3" />,
  };
  return iconMap[subCategory] || <Sparkles className="w-3 h-3" />;
};

// Subcategory mappings as specified in the prompt
const getSubCategories = (categoryName: string): string[] => {
  const subCategoriesMap: { [key: string]: string[] } = {
    "All Category": [
      "Weight loss", "Confidence", "Anxiety", "Breakups", "Skin", 
      "Energy", "Depression", "Communication", "Immunity", "Self-love"
    ],
    "Fitness and Yoga": ["Weight loss", "Strength training", "PCOS", "Back pain", "Flexibility", "Ashtanga", "Prenatal"],
    "Nutrition and Diet": ["PCOS", "Weight loss", "Weight gain", "Skin", "Immunity", "Gut health", "Thyroid", "Diabetes", "Hormonal"],
    "Relationship and Parenting": ["Breakups", "Dating", "Marriage", "Parenting", "Communication", "Conflict"],
    "Self improvement & growth": ["Confidence", "Energy", "Communication", "Healing", "Self-worth", "Self-love"],
    "Mental Health and Counselling": ["Anxiety", "Depression", "Trauma", "Burnout", "Stress", "Anger", "Overthinking"],
  };

  return subCategoriesMap[categoryName] || [];
};

// Get background color for categories (lighter tones)
const getCategoryBgColor = (categoryName: string) => {
  const colorMap: { [key: string]: string } = {
    "All Category": "bg-gray-25 hover:bg-gray-50 text-gray-500",
    "Mental Health and Counselling": "bg-indigo-25 hover:bg-indigo-50 text-indigo-500",
    "Fitness and Yoga": "bg-blue-25 hover:bg-blue-50 text-blue-500",
    "Nutrition and Diet": "bg-green-25 hover:bg-green-50 text-green-500",
    "Relationship and Parenting": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    "Self improvement & growth": "bg-yellow-25 hover:bg-yellow-50 text-yellow-500",
    "Others": "bg-purple-25 hover:bg-purple-50 text-purple-500",
  };
  return colorMap[categoryName] || "bg-gray-25 hover:bg-gray-50 text-gray-500";
};

// Get background color for subcategories (very light minimal tones)
const getSubCategoryBgColor = (subCategory: string) => {
  const colorMap: { [key: string]: string } = {
    // Fitness and Yoga
    "Weight loss": "bg-red-25 hover:bg-red-50 text-red-500",
    "Strength training": "bg-blue-25 hover:bg-blue-50 text-blue-500",
    "PCOS": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    "Back pain": "bg-orange-25 hover:bg-orange-50 text-orange-500",
    "Flexibility": "bg-green-25 hover:bg-green-50 text-green-500",
    "Ashtanga": "bg-purple-25 hover:bg-purple-50 text-purple-500",
    "Prenatal": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    
    // Nutrition and Diet
    "Weight gain": "bg-blue-25 hover:bg-blue-50 text-blue-500",
    "Skin": "bg-green-25 hover:bg-green-50 text-green-500",
    "Immunity": "bg-yellow-25 hover:bg-yellow-50 text-yellow-500",
    "Gut health": "bg-orange-25 hover:bg-orange-50 text-orange-500",
    "Thyroid": "bg-purple-25 hover:bg-purple-50 text-purple-500",
    "Diabetes": "bg-red-25 hover:bg-red-50 text-red-500",
    "Hormonal": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    
    // Relationship and Parenting
    "Breakups": "bg-red-25 hover:bg-red-50 text-red-500",
    "Dating": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    "Marriage": "bg-purple-25 hover:bg-purple-50 text-purple-500",
    "Parenting": "bg-blue-25 hover:bg-blue-50 text-blue-500",
    "Communication": "bg-green-25 hover:bg-green-50 text-green-500",
    "Conflict": "bg-orange-25 hover:bg-orange-50 text-orange-500",
    
    // Self improvement & growth
    "Confidence": "bg-yellow-25 hover:bg-yellow-50 text-yellow-500",
    "Energy": "bg-orange-25 hover:bg-orange-50 text-orange-500",
    "Healing": "bg-green-25 hover:bg-green-50 text-green-500",
    "Self-worth": "bg-purple-25 hover:bg-purple-50 text-purple-500",
    "Self-love": "bg-pink-25 hover:bg-pink-50 text-pink-500",
    
    // Mental Health and Counselling
    "Anxiety": "bg-yellow-25 hover:bg-yellow-50 text-yellow-500",
    "Depression": "bg-blue-25 hover:bg-blue-50 text-blue-500",
    "Trauma": "bg-red-25 hover:bg-red-50 text-red-500",
    "Burnout": "bg-orange-25 hover:bg-orange-50 text-orange-500",
    "Stress": "bg-green-25 hover:bg-green-50 text-green-500",
    "Anger": "bg-red-25 hover:bg-red-50 text-red-500",
    "Overthinking": "bg-purple-25 hover:bg-purple-50 text-purple-500",
  };
  return colorMap[subCategory] || "bg-gray-25 hover:bg-gray-50 text-gray-500";
};

function CategoryBar({
  categorys,
  selectCategory,
  selectedCategoryId,
  selectSubCategory,
  selectedSubCategory,
}: CategoryBarProps) {
  // Get the selected category name from the actual selected category ID
  const selectedCategory = categorys?.find(cat => cat._id === selectedCategoryId);
  const selectedCategoryName = selectedCategory?.name || null;

  const handleCategorySelect = (id: string, name: string) => {
    selectCategory(id);
    
    // Clear subcategory selection when switching categories
    if (selectSubCategory) {
      selectSubCategory("");
    }
  };

  const handleSubCategorySelect = (subCategory: string) => {
    if (selectSubCategory) {
      selectSubCategory(subCategory);
    }
  };

  const subCategories = selectedCategoryName ? getSubCategories(selectedCategoryName) : [];

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Categories - 2 rows on mobile, single row on desktop */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-wrap sm:flex-nowrap sm:gap-2 w-full sm:overflow-x-auto sm:scrollbar-hide gap-1.5 sm:gap-2 justify-center">
            {categorys?.map((cat: Category) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat._id, cat.name)}
                className={`group relative px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-sm hover:shadow-md flex-shrink-0
                  ${getCategoryBgColor(cat.name)}
                  ${selectedCategoryId === cat._id 
                    ? 'border border-blue-400 shadow-md transform scale-102' 
                    : 'border border-transparent hover:scale-102'
                  }
                `}
              >
                {/* Icon */}
                <div className="transition-all duration-300 text-current">
                  {getCategoryIcon(cat.name)}
                </div>
                
                {/* Text */}
                <span className="relative whitespace-nowrap hidden sm:inline">{cat.name}</span>
                <span className="relative whitespace-nowrap sm:hidden">
                  {cat.name === "All Category" ? "All" : 
                   cat.name === "Mental Health and Counselling" ? "Mental" :
                   cat.name === "Relationship and Parenting" ? "Relations" :
                   cat.name === "Self improvement & growth" ? "Growth" :
                   cat.name === "Nutrition and Diet" ? "Nutrition" :
                   cat.name === "Fitness and Yoga" ? "Fitness" : cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories - Single row with horizontal scroll */}
        {subCategories.length > 0 && (
          <div className="flex justify-center mb-4">
            <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide justify-center">
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory}
                  onClick={() => handleSubCategorySelect(subCategory)}
                                  className={`group relative px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-md flex-shrink-0
                  ${getSubCategoryBgColor(subCategory)}
                  ${selectedSubCategory === subCategory 
                    ? 'border border-blue-400 shadow-md transform scale-102' 
                    : 'border border-transparent hover:scale-102'
                  }
                `}
                >
                  {/* Icon */}
                  <div className="transition-all duration-300 text-current">
                    {getSubCategoryIcon(subCategory)}
                  </div>
                  
                  {/* Text */}
                  <span className="relative whitespace-nowrap hidden sm:inline">{subCategory}</span>
                  <span className="relative whitespace-nowrap sm:hidden">
                    {subCategory === "Weight loss" ? "Weight Loss" :
                     subCategory === "Strength training" ? "Strength" :
                     subCategory === "Mental Health and Counselling" ? "Mental" :
                     subCategory === "Self improvement & growth" ? "Growth" :
                     subCategory === "Relationship and Parenting" ? "Relations" :
                     subCategory === "Nutrition and Diet" ? "Nutrition" :
                     subCategory === "Fitness and Yoga" ? "Fitness" :
                     subCategory === "Communication" ? "Comm" :
                     subCategory === "Self-worth" ? "Worth" :
                     subCategory === "Self-love" ? "Love" :
                     subCategory === "Overthinking" ? "Overthink" :
                     subCategory === "Gut health" ? "Gut" :
                     subCategory === "Back pain" ? "Back" :
                     subCategory === "Weight gain" ? "Gain" :
                     subCategory === "Burnout" ? "Burnout" :
                     subCategory === "Conflict" ? "Conflict" :
                     subCategory === "Immunity" ? "Immunity" :
                     subCategory === "Hormonal" ? "Hormonal" :
                     subCategory === "Diabetes" ? "Diabetes" :
                     subCategory === "Thyroid" ? "Thyroid" :
                     subCategory === "Prenatal" ? "Prenatal" :
                     subCategory === "Ashtanga" ? "Ashtanga" :
                     subCategory === "Flexibility" ? "Flex" :
                     subCategory === "Healing" ? "Healing" :
                     subCategory === "Energy" ? "Energy" :
                     subCategory === "Confidence" ? "Confidence" :
                     subCategory === "Anxiety" ? "Anxiety" :
                     subCategory === "Depression" ? "Depression" :
                     subCategory === "Trauma" ? "Trauma" :
                     subCategory === "Stress" ? "Stress" :
                     subCategory === "Anger" ? "Anger" :
                     subCategory === "Breakups" ? "Breakups" :
                     subCategory === "Dating" ? "Dating" :
                     subCategory === "Marriage" ? "Marriage" :
                     subCategory === "Parenting" ? "Parenting" :
                     subCategory === "PCOS" ? "PCOS" :
                     subCategory === "Skin" ? "Skin" :
                     subCategory === "Weight loss" ? "Weight Loss" :
                     subCategory}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryBar;
