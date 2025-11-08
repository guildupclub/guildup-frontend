import React from "react";
import { Metadata } from "next";
import { getAllBlogPostsMetadata, getAllCategories, BlogPostMetadata } from "@/lib/blog";
import BlogsClient from "@/components/blogs/BlogsClient";

// SEO metadata - now properly in server component
export const metadata: Metadata = {
  title: "Insights & Stories - Expert Articles | GuildUp",
  description: "Discover the latest insights, tips, and stories from our community of creators and innovators. Expert articles on community building, networking, and digital growth.",
  keywords: ["blog", "articles", "community building", "digital marketing", "insights", "expert advice"],
  openGraph: {
    title: "Insights & Stories - Expert Articles",
    description: "Discover the latest insights, tips, and stories from our community of creators and innovators.",
    type: "website",
    url: "/blogs"
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights & Stories - Expert Articles",
    description: "Discover the latest insights, tips, and stories from our community of creators and innovators."
  }
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogsPage() {
  // Server-side data fetching from Notion
  let blogPosts: BlogPostMetadata[] = [];
  let categories: string[] = ['All'];
  let error: string | null = null;
  
  try {
    // Check if Notion is configured
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
      console.warn('Notion API not configured. Missing NOTION_API_KEY or NOTION_DATABASE_ID');
      error = 'Notion API not configured';
    } else {
      [blogPosts, categories] = await Promise.all([
        getAllBlogPostsMetadata(),
        getAllCategories()
      ]);
      
      console.log(`Fetched ${blogPosts.length} blog posts from Notion`);
    }
  } catch (err) {
    console.error('Error fetching blog posts from Notion:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch blog posts';
    // Continue with empty arrays if there's an error
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "GuildUp Insights & Stories",
            "description": "Expert articles and insights on community building, networking, and digital growth",
            "url": "https://guildup.club/blogs",
            "publisher": {
              "@type": "Organization",
              "name": "GuildUp",
              "url": "https://guildup.club"
            },
            "blogPost": blogPosts.slice(0, 10).map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "author": {
                "@type": "Person",
                "name": post.author
              },
              "datePublished": post.date,
              "url": `https://guildup.club/blogs/${post.slug}`,
              "image": post.image,
              "keywords": post.tags.join(", ")
            }))
          })
        }}
      />

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Insights & Wellness Stories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dive into evidence-based health insights, practical wellness tips, and inspiring stories from our community of health professionals and wellness experts.
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> {error}. Please check your Notion configuration.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && blogPosts.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              No blog posts found. Make sure you have published posts in your Notion database.
            </p>
          </div>
        </div>
      )}

      {/* Client-side interactive content */}
      {!error && blogPosts.length > 0 && (
        <BlogsClient 
          initialBlogPosts={blogPosts}
          categories={categories}
        />
      )}
    </div>
  );
} 