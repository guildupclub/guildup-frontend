"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Clock, User, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { 
  BlogPostMetadata, 
  searchBlogPostsClient, 
  formatDate
} from "@/lib/blog-client";

interface BlogsClientProps {
  initialBlogPosts: BlogPostMetadata[];
  categories: string[];
}

export default function BlogsClient({ 
  initialBlogPosts, 
  categories
}: BlogsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPostMetadata[]>(initialBlogPosts);
  const [loading, setLoading] = useState(false);

  // Filter blogs when search or category changes
  useEffect(() => {
    try {
      setLoading(true);
      const filtered = searchBlogPostsClient(initialBlogPosts, searchQuery, selectedCategory);
      setFilteredBlogs(filtered);
    } catch (error) {
      console.error("Error filtering blogs:", error);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, initialBlogPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search and Filter Section */}
      {/* 
      <div className="mb-10 flex flex-col sm:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-lg transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-lg font-medium transition-all duration-300"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      */}

      {/* Results Count */}
      {/* 
      <div className="mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 inline-block">
          <p className="text-gray-700 font-medium">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </span>
            ) : (
              `${filteredBlogs.length} article${filteredBlogs.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>
      </div>
      */}

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map((blog: BlogPostMetadata) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`}>
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2">
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full shadow-lg">
                    {blog.category}
                  </span>
                </div>
                {blog.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-full shadow-lg">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                  {blog.title}
                </h2>
                
                <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                  {blog.excerpt}
                </p>
                
                {/* Tags */}
                {blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                        +{blog.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{blog.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">{formatDate(blog.date)}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filteredBlogs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or explore different categories.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
} 