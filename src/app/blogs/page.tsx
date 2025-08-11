import React from "react";
import { Metadata } from "next";
import { getAllBlogPostsMetadata, getAllCategories } from "@/lib/blog";
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

export default async function BlogsPage() {
  // Server-side data fetching
  const [blogPosts, categories] = await Promise.all([
    getAllBlogPostsMetadata(),
    getAllCategories()
  ]);

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
            "url": "https://guildup.com/blogs",
            "publisher": {
              "@type": "Organization",
              "name": "GuildUp",
              "url": "https://guildup.com"
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
              "url": `https://guildup.com/blogs/${post.slug}`,
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

      {/* Client-side interactive content */}
      <BlogsClient 
        initialBlogPosts={blogPosts}
        categories={categories}
      />
    </div>
  );
} 