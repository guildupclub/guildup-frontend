"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

interface PodcastEpisode {
  id: number;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  publishDate: string;
  category: string;
  guests: string[];
}

interface PodcastEmbedProps {
  podcast: PodcastEpisode;
}

export default function PodcastEmbed({ podcast }: PodcastEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* YouTube Embed */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading video...</p>
            </div>
          </div>
        )}
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${podcast.youtubeId}?rel=0&modestbranding=1`}
          title={podcast.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <Badge className={getCategoryColor(podcast.category)}>
            {podcast.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 transition-colors">
          {podcast.title}
        </h3>

        {/* Description */}
        <p 
          className="text-gray-600 mb-4"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {podcast.description}
        </p>

        {/* Guests */}
        {podcast.guests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Featured Guests:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {podcast.guests.map((guest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {guest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{podcast.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(podcast.publishDate)}</span>
            </div>
          </div>
          
          {/* YouTube Link */}
          <a
            href={`https://www.youtube.com/watch?v=${podcast.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Watch on YouTube →
          </a>
        </div>
      </div>
    </Card>
  );
} 