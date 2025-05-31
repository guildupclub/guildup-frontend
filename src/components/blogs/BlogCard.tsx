"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Calendar, User } from 'lucide-react';
import Image from 'next/image';

interface BlogPost {
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
}

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const handleReadMore = () => {
    window.open(blog.externalUrl, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'mental-health': 'bg-blue-100 text-blue-800',
      'career': 'bg-green-100 text-green-800',
      'relationships': 'bg-purple-100 text-purple-800',
      'wellness': 'bg-yellow-100 text-yellow-800',
      'productivity': 'bg-red-100 text-red-800',
      'leadership': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge className={getCategoryColor(blog.category)}>
            {blog.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 
          className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {blog.title}
        </h3>
        
        <p 
          className="text-gray-600 mb-4 flex-grow"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {blog.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {blog.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{blog.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(blog.publishDate)}</span>
          </div>
        </div>

        {/* Read More Button */}
        <Button 
          onClick={handleReadMore}
          className="w-full group-hover:bg-blue-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Read Full Article
        </Button>
      </div>
    </Card>
  );
} 