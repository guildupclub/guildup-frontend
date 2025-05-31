"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play, Clock, Calendar, Users, Sparkles, TrendingUp, Heart } from 'lucide-react';
import BlogCard from '@/components/blogs/BlogCard';

// Import data from separate files
import { blogPosts, getBlogsByCategory, type BlogPost } from '@/data/blogData';
import { podcastEpisodes, getPodcastsByCategory, type PodcastEpisode } from '@/data/podcastData';
import CategoryFilter from '@/components/blogs/CategoryFilter';
import PodcastEmbed from '@/components/blogs/PodcastEmbed';

// Blog categories configuration
const blogCategories = [
  { id: 'all', name: 'All Topics', color: 'bg-gray-100' },
  { id: 'mental-health', name: 'Mental Health', color: 'bg-blue-100' },
  { id: 'career', name: 'Career Development', color: 'bg-green-100' },
  { id: 'relationships', name: 'Relationships', color: 'bg-purple-100' },
  { id: 'wellness', name: 'Wellness', color: 'bg-yellow-100' },
  { id: 'productivity', name: 'Productivity', color: 'bg-red-100' },
  { id: 'leadership', name: 'Leadership', color: 'bg-indigo-100' },
];

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'blogs' | 'podcasts'>('blogs');

  // Use helper functions to filter data
  const filteredBlogs = getBlogsByCategory(selectedCategory);
  const filteredPodcasts = getPodcastsByCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Personal Growth Content</span>
            </div> */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Potential
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover curated insights from world-class experts, thought leaders, and coaches. 
              Your journey to extraordinary growth starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-3 bg-white text-primary hover:bg-gray-100 font-semibold"
                onClick={() => setActiveTab('blogs')}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Explore Articles
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-3 border-white text-primary hover:bg-gray-100 font-semibold"
                onClick={() => setActiveTab('podcasts')}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Podcasts
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-xl p-2 shadow-lg border">
            <Button
              variant={activeTab === 'blogs' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 rounded-lg font-medium ${
                activeTab === 'blogs' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Articles
            </Button>
            <Button
              variant={activeTab === 'podcasts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('podcasts')}
              className={`px-6 py-3 rounded-lg font-medium ${
                activeTab === 'podcasts' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Play className="h-4 w-4 mr-2" />
              Podcasts
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={blogCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Content Section */}
        {activeTab === 'blogs' ? (
          <div className="space-y-10">
            {/* Stats Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                    <ExternalLink className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{filteredBlogs.length}</div>
                  <div className="text-gray-600 font-medium">Curated Articles</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{blogCategories.length - 1}</div>
                  <div className="text-gray-600 font-medium">Categories</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{blogPosts.length}</div>
                  <div className="text-gray-600 font-medium">Total Content</div>
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Podcast Stats */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
                    <Play className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{filteredPodcasts.length}</div>
                  <div className="text-gray-600 font-medium">Episodes</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{podcastEpisodes.length}</div>
                  <div className="text-gray-600 font-medium">Total Podcasts</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
                  <div className="text-gray-600 font-medium">Hours of Content</div>
                </div>
              </div>
            </div>

            {/* Podcast Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {filteredPodcasts.map((podcast) => (
                <PodcastEmbed key={podcast.id} podcast={podcast} />
              ))}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {((activeTab === 'blogs' && filteredBlogs.length === 0) || 
          (activeTab === 'podcasts' && filteredPodcasts.length === 0)) && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              We're working on adding great content for this category. 
              Check back soon or explore other topics.
            </p>
            <Button 
              onClick={() => setSelectedCategory('all')}
              className="bg-primary text-white hover:bg-primary/90"
            >
              View All Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 