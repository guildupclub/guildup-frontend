export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Why Does One Bloat? Understanding the Causes and Solutions",
    excerpt: "Discover the real reasons behind bloating and learn proven strategies to reduce discomfort and improve digestive health.",
    author: "Dr. Priya Sharma",
    date: "2025-07-25",
    readTime: "6 min read",
    category: "Digestive Health",
    image: "/blog-images/Gemini_Generated_Image_1ttijj1ttijj1tti.jpeg",
    slug: "why-does-one-bloat"
  },
  {
    id: "2",
    title: "Community Monetization Strategies",
    excerpt: "Discover ethical and effective ways to monetize your community while maintaining trust and value for your members.",
    author: "Lisa Park",
    date: "2024-01-05",
    readTime: "7 min",
    category: "Business",
    image: "https://picsum.photos/400/250?random=5",
    slug: "community-monetization-strategies"
  },
  {
    id: "3",
    title: "The Psychology of Online Engagement",
    excerpt: "Understanding what drives people to engage online and how to create content that resonates with your audience.",
    author: "Dr. James Smith",
    date: "2024-01-03",
    readTime: "12 min",
    category: "Psychology",
    image: "https://picsum.photos/400/250?random=6",
    slug: "psychology-online-engagement"
  }
];

export const getBlogsByCategory = (category: string): BlogPost[] => {
  if (category === "All") return blogPosts;
  return blogPosts.filter(blog => blog.category === category);
};

export const getBlogsBySearch = (query: string, category: string): BlogPost[] => {
  let filtered = getBlogsByCategory(category);
  if (query.trim()) {
    const lowercaseQuery = query.toLowerCase();
    filtered = filtered.filter(blog => 
      blog.title.toLowerCase().includes(lowercaseQuery) ||
      blog.excerpt.toLowerCase().includes(lowercaseQuery) ||
      blog.author.toLowerCase().includes(lowercaseQuery)
    );
  }
  return filtered;
}; 