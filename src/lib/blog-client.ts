// Client-side blog utilities (no Node.js dependencies)

export interface BlogPostMetadata {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  tags: string[];
  featured: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// Client-side search function that works with pre-loaded data
export function searchBlogPostsClient(
  posts: BlogPostMetadata[], 
  query: string, 
  category: string = 'All'
): BlogPostMetadata[] {
  let filteredPosts = posts;
  
  // Filter by category first
  if (category !== 'All') {
    filteredPosts = posts.filter(post => post.category === category);
  }
  
  // If no search query, return category-filtered results
  if (!query.trim()) {
    return filteredPosts;
  }
  
  // Search in title, excerpt, author, and tags
  const lowercaseQuery = query.toLowerCase();
  
  return filteredPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.author.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Get posts by category (client-side)
export function getBlogPostsByCategoryClient(
  posts: BlogPostMetadata[], 
  category: string
): BlogPostMetadata[] {
  if (category === 'All') {
    return posts;
  }
  
  return posts.filter(post => post.category === category);
}

// Get featured posts (client-side)
export function getFeaturedBlogPostsClient(posts: BlogPostMetadata[]): BlogPostMetadata[] {
  return posts.filter(post => post.featured);
}

// Format date utility
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Format listen count utility
export function formatListens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
} 