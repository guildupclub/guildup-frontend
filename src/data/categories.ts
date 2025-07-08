// Content categories for blogs and podcasts
export const contentCategories = [
  "All",
  "Community",
  "Networking", 
  "Content",
  "Branding",
  "Business",
  "Psychology",
  "Technology",
  "Marketing",
  "Leadership",
  "Entrepreneurship",
  "Design",
  "Development",
  "Finance",
  "Health & Wellness",
  "Education",
  "Productivity",
  "Innovation"
];

// Blog-specific categories (these will be dynamically loaded from markdown files)
export const blogCategories = [
  "All",
  "Community",
  "Networking",
  "Content",
  "Branding", 
  "Business",
  "Psychology",
  "Technology",
  "Marketing",
  "Leadership"
];

// Podcast categories
export const podcastCategories = [
  "All",
  "Business",
  "Technology", 
  "Education",
  "Health",
  "Design",
  "Marketing",
  "Leadership",
  "Entrepreneurship"
];

// Community categories
export const communityCategories = [
  "All",
  "Technology",
  "Business",
  "Design",
  "Marketing",
  "Education",
  "Health & Wellness",
  "Finance",
  "Entrepreneurship",
  "Creative Arts",
  "Science",
  "Sports & Fitness",
  "Travel",
  "Food & Cooking",
  "Photography",
  "Music",
  "Gaming",
  "Sustainability"
];

// Offering categories
export const offeringCategories = [
  "All",
  "Consultation",
  "Coaching",
  "Training",
  "Webinar",
  "Workshop",
  "Course",
  "Mentorship",
  "Speaking",
  "Freelance Services"
];

// Tag suggestions for content creation
export const popularTags = [
  "community",
  "networking", 
  "digital",
  "strategy",
  "growth",
  "marketing",
  "leadership",
  "innovation",
  "technology",
  "business",
  "entrepreneurship",
  "productivity",
  "success",
  "mindset",
  "trends",
  "tips",
  "best-practices",
  "case-study",
  "tutorial",
  "guide"
];

// Get category color for UI purposes
export function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    "Community": "bg-blue-100 text-blue-800",
    "Networking": "bg-green-100 text-green-800", 
    "Content": "bg-purple-100 text-purple-800",
    "Branding": "bg-pink-100 text-pink-800",
    "Business": "bg-orange-100 text-orange-800",
    "Psychology": "bg-indigo-100 text-indigo-800",
    "Technology": "bg-gray-100 text-gray-800",
    "Marketing": "bg-red-100 text-red-800",
    "Leadership": "bg-yellow-100 text-yellow-800",
    "Design": "bg-teal-100 text-teal-800",
    "Education": "bg-cyan-100 text-cyan-800",
    "Health & Wellness": "bg-emerald-100 text-emerald-800",
    "Finance": "bg-amber-100 text-amber-800"
  };

  return colorMap[category] || "bg-gray-100 text-gray-800";
}

// Get category icon
export function getCategoryIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    "Community": "👥",
    "Networking": "🤝", 
    "Content": "📝",
    "Branding": "🎨",
    "Business": "💼",
    "Psychology": "🧠",
    "Technology": "💻",
    "Marketing": "📢",
    "Leadership": "👑",
    "Design": "🎭",
    "Education": "📚",
    "Health & Wellness": "🏃‍♂️",
    "Finance": "💰"
  };

  return iconMap[category] || "📄";
} 