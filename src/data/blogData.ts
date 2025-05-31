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
    title: "The Future of Community Building in Digital Spaces",
    excerpt: "Explore how digital communities are evolving and what it means for creators and members alike. Discover the latest trends and strategies.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Community",
    image: "https://picsum.photos/400/250?random=1",
    slug: "future-of-community-building"
  },
  {
    id: "2",
    title: "Building Meaningful Connections Online",
    excerpt: "Learn effective strategies for fostering genuine relationships in virtual environments. Tips and best practices from successful community leaders.",
    author: "Mike Chen",
    date: "2024-01-12",
    readTime: "8 min",
    category: "Networking",
    image: "https://picsum.photos/400/250?random=2",
    slug: "building-meaningful-connections"
  },
  {
    id: "3",
    title: "The Art of Digital Storytelling",
    excerpt: "Master the craft of engaging your audience through compelling narratives. Techniques that work across all digital platforms.",
    author: "Emma Wilson",
    date: "2024-01-10",
    readTime: "6 min",
    category: "Content",
    image: "https://picsum.photos/400/250?random=3",
    slug: "art-of-digital-storytelling"
  },
  {
    id: "4",
    title: "Growing Your Personal Brand",
    excerpt: "Essential steps to establish and grow your personal brand in today's competitive digital landscape. From strategy to execution.",
    author: "David Rodriguez",
    date: "2024-01-08",
    readTime: "10 min",
    category: "Branding",
    image: "https://picsum.photos/400/250?random=4",
    slug: "growing-personal-brand"
  },
  {
    id: "5",
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
    id: "6",
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