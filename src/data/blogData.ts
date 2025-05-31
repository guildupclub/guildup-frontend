export interface BlogPost {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  imageUrl: string;
  externalUrl: string;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Strategies for Managing Workplace Anxiety",
    description: "Discover effective techniques to handle anxiety in professional settings and maintain your mental well-being.",
    category: "mental-health",
    author: "Dr. Sarah Wilson",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop",
    externalUrl: "https://medium.com/@example/workplace-anxiety-strategies",
    tags: ["anxiety", "workplace", "mental health"],
    featured: true
  },
  {
    id: 2,
    title: "Building Resilient Teams in Remote Work",
    description: "Learn how to create strong, connected teams that thrive in virtual environments.",
    category: "leadership",
    author: "Mark Johnson",
    publishDate: "2024-01-12",
    readTime: "12 min read",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    externalUrl: "https://hbr.org/example/remote-team-building",
    tags: ["leadership", "remote work", "team building"],
    featured: false
  },
  {
    id: 3,
    title: "The Science of Habit Formation",
    description: "Understanding the psychology behind habits and how to build positive routines.",
    category: "productivity",
    author: "Dr. Emily Chen",
    publishDate: "2024-01-10",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=250&fit=crop",
    externalUrl: "https://psychologytoday.com/example/habit-formation",
    tags: ["habits", "psychology", "productivity"],
    featured: true
  },
  {
    id: 4,
    title: "Healthy Relationship Boundaries",
    description: "Essential guide to setting and maintaining healthy boundaries in all relationships.",
    category: "relationships",
    author: "Lisa Martinez",
    publishDate: "2024-01-08",
    readTime: "10 min read",
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=250&fit=crop",
    externalUrl: "https://relationshipgoals.com/example/boundaries",
    tags: ["boundaries", "relationships", "communication"],
    featured: false
  },
  {
    id: 5,
    title: "Career Transition Strategies",
    description: "Navigate career changes with confidence using these proven strategies and frameworks.",
    category: "career",
    author: "James Robinson",
    publishDate: "2024-01-05",
    readTime: "15 min read",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    externalUrl: "https://linkedin.com/example/career-transition",
    tags: ["career change", "professional development", "strategy"],
    featured: true
  },
  {
    id: 6,
    title: "Mindfulness in Daily Life",
    description: "Simple mindfulness practices you can incorporate into your daily routine for better well-being.",
    category: "wellness",
    author: "Dr. Michael Brown",
    publishDate: "2024-01-03",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    externalUrl: "https://mindful.org/example/daily-mindfulness",
    tags: ["mindfulness", "wellness", "meditation"],
    featured: false
  }
];

// Helper functions for filtering and managing blog data
export const getFeaturedBlogs = (): BlogPost[] => {
  return blogPosts.filter(blog => blog.featured);
};

export const getBlogsByCategory = (category: string): BlogPost[] => {
  if (category === 'all') return blogPosts;
  return blogPosts.filter(blog => blog.category === category);
};

export const getLatestBlogs = (limit: number = 3): BlogPost[] => {
  return blogPosts
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getBlogById = (id: number): BlogPost | undefined => {
  return blogPosts.find(blog => blog.id === id);
};

export const searchBlogs = (query: string): BlogPost[] => {
  const searchTerm = query.toLowerCase();
  return blogPosts.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm) ||
    blog.description.toLowerCase().includes(searchTerm) ||
    blog.author.toLowerCase().includes(searchTerm) ||
    blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}; 