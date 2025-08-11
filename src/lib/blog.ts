import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';

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

// Constants
const BLOG_DIRECTORY = path.join(process.cwd(), 'data', 'blog');

// Utility function to ensure blog directory exists
function ensureBlogDirectory() {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    fs.mkdirSync(BLOG_DIRECTORY, { recursive: true });
  }
}

// Read all markdown files from blog directory
export function getBlogFileNames(): string[] {
  ensureBlogDirectory();
  
  try {
    return fs.readdirSync(BLOG_DIRECTORY)
      .filter(fileName => fileName.endsWith('.md'))
      .sort((a, b) => {
        // Sort by filename (which should include dates)
        return b.localeCompare(a);
      });
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}

// Parse markdown content and frontmatter
export async function parseMarkdownFile(fileName: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(BLOG_DIRECTORY, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Process markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkHtml, { sanitize: false })
      .process(content);

    let contentHtml = processedContent.toString();

    // Add IDs to headings for table of contents
    contentHtml = contentHtml.replace(
      /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/g,
      (match, level, text) => {
        const cleanText = text.replace(/<[^>]*>/g, '');
        const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
    );

    // Generate ID from filename
    const id = fileName.replace(/\.md$/, '');

    // Validate required frontmatter fields
    const requiredFields = ['title', 'excerpt', 'author', 'date', 'category', 'slug'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.warn(`Missing required field '${field}' in ${fileName}`);
        return null;
      }
    }

    return {
      id,
      title: data.title,
      excerpt: data.excerpt,
      author: data.author,
      date: data.date,
      readTime: data.readTime || '5 min',
      category: data.category,
      image: data.image || `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`,
      slug: data.slug,
      tags: data.tags || [],
      featured: data.featured || false,
      content: contentHtml,
      seo: {
        metaTitle: data.seo?.metaTitle || data.title,
        metaDescription: data.seo?.metaDescription || data.excerpt,
        keywords: data.seo?.keywords || data.tags || []
      }
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${fileName}:`, error);
    return null;
  }
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const fileNames = getBlogFileNames();
  const posts: BlogPost[] = [];

  for (const fileName of fileNames) {
    const post = await parseMarkdownFile(fileName);
    if (post) {
      posts.push(post);
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get blog post metadata only (without content)
export async function getAllBlogPostsMetadata(): Promise<BlogPostMetadata[]> {
  const posts = await getAllBlogPosts();
  return posts.map(({ content, ...metadata }) => metadata);
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const fileNames = getBlogFileNames();
  
  for (const fileName of fileNames) {
    const post = await parseMarkdownFile(fileName);
    if (post && post.slug === slug) {
      return post;
    }
  }
  
  return null;
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
  const allPosts = await getAllBlogPostsMetadata();
  const categories = [...new Set(allPosts.map(post => post.category))];
  return ['All', ...categories.sort()];
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