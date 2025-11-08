// Types
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
  tags: string[];
  featured: boolean;
  content?: string; // HTML content
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface BlogPostMetadata extends Omit<BlogPost, 'content'> {}

// Import Notion functions
import {
  fetchAllBlogPostsFromNotion,
  fetchBlogPostBySlugFromNotion,
  getAllCategoriesFromNotion
} from './notion';

// Get all blog posts from Notion
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    return await fetchAllBlogPostsFromNotion();
  } catch (error) {
    console.error('Error fetching blog posts from Notion:', error);
    return [];
  }
}

// Get blog post metadata only (without content)
export async function getAllBlogPostsMetadata(): Promise<BlogPostMetadata[]> {
  try {
    const posts = await getAllBlogPosts();
    return posts.map(({ content, ...metadata }) => metadata);
  } catch (error) {
    console.error('Error fetching blog posts metadata:', error);
    return [];
  }
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await fetchBlogPostBySlugFromNotion(slug);
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}

// Legacy function for compatibility (returns empty array)
export function getBlogFileNames(): string[] {
  return [];
}

// Get related blog posts (same category, different slug)
export async function getRelatedBlogPosts(slug: string, category: string, limit: number = 3): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllBlogPostsMetadata();
  
  return allPosts
    .filter(post => post.category === category && post.slug !== slug)
    .slice(0, limit);
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllBlogPostsMetadata();
  return allPosts.filter(post => post.featured);
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllBlogPostsMetadata();
  
  if (category === 'All') {
    return allPosts;
  }
  
  return allPosts.filter(post => post.category === category);
}

// Search blog posts
export async function searchBlogPosts(query: string, category: string = 'All'): Promise<BlogPostMetadata[]> {
  let posts = await getBlogPostsByCategory(category);
  
  if (!query.trim()) {
    return posts;
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.author.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  try {
    return await getAllCategoriesFromNotion();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['All'];
  }
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllBlogPostsMetadata();
  const allTags = allPosts.flatMap(post => post.tags);
  return [...new Set(allTags)].sort();
}

// Generate reading time estimate
export function generateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

// Generate blog post slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate blog post frontmatter
export function validateBlogPost(data: any): string[] {
  const errors: string[] = [];
  const requiredFields = ['title', 'excerpt', 'author', 'date', 'category', 'slug'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate date format
  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('Invalid date format. Use YYYY-MM-DD format.');
  }
  
  // Validate slug format
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
  }
  
  return errors;
}

// Get blog statistics
export async function getBlogStats() {
  const allPosts = await getAllBlogPostsMetadata();
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  const categoryStats = categories.slice(1).map(category => ({
    category,
    count: allPosts.filter(post => post.category === category).length
  }));
  
  const authorStats = [...new Set(allPosts.map(post => post.author))].map(author => ({
    author,
    count: allPosts.filter(post => post.author === author).length
  }));
  
  return {
    totalPosts: allPosts.length,
    totalCategories: categories.length - 1, // Exclude 'All'
    totalTags: tags.length,
    featuredPosts: allPosts.filter(post => post.featured).length,
    categoryStats: categoryStats.sort((a, b) => b.count - a.count),
    authorStats: authorStats.sort((a, b) => b.count - a.count),
    latestPost: allPosts[0] || null,
    oldestPost: allPosts[allPosts.length - 1] || null
  };
} 