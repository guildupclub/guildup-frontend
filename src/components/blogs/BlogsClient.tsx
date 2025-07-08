"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Clock, User, Calendar, Play, Headphones, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { 
  BlogPostMetadata, 
  searchBlogPostsClient, 
  formatDate, 
  formatListens 
} from "@/lib/blog-client";
import { Podcast, getPodcastsBySearch } from "@/data/podcastData";

interface BlogsClientProps {
  initialBlogPosts: BlogPostMetadata[];
  categories: string[];
  podcastEpisodes: Podcast[];
}

export default function BlogsClient({ 
  initialBlogPosts, 
  categories, 
  podcastEpisodes 
}: BlogsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"blogs" | "podcasts">("blogs");
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

  const filteredPodcasts = getPodcastsBySearch(searchQuery, selectedCategory);
  const currentItems = activeTab === "blogs" ? filteredBlogs : filteredPodcasts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl p-2 shadow-sm border">
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "blogs" 
                ? "bg-primary text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4 mr-2 inline" />
            Articles ({initialBlogPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("podcasts")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "podcasts" 
                ? "bg-primary text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Headphones className="w-4 h-4 mr-2 inline" />
            Podcasts ({podcastEpisodes.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? "Searching..." : `${currentItems.length} ${activeTab === "blogs" ? "article" : "episode"}${currentItems.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Content Grid */}
      {activeTab === "blogs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog: BlogPostMetadata) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}>
              <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  {blog.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPodcasts.map((podcast: Podcast) => (
            <div key={podcast.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
              <div className="flex">
                <div className="relative w-32 h-32 bg-gray-200 flex-shrink-0">
                  <Image
                    src={podcast.image}
                    alt={podcast.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors duration-200">
                      <Play className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      {podcast.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">
                    {podcast.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {podcast.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{podcast.host}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{podcast.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{formatListens(podcast.listens)}</span>
                      </div>
                      <span>{formatDate(podcast.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === "blogs" ? (
              <User className="w-8 h-8 text-gray-400" />
            ) : (
              <Headphones className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No {activeTab === "blogs" ? "articles" : "episodes"} found
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