"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price?: number;
  duration: number;
  is_free?: boolean;
  tags?: string[];
  rating?: number;
  total_ratings?: number;
  features?: string[];
  community_id: string;
  provider_id: string;
  provider?: {
    name: string;
    avatar?: string;
    expertise?: string;
  };
}

interface Community {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
}

export default function CommunityOfferingsPage() {
  const router = useRouter();
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  
  // Extract community ID from the parameter (format: "community-name-communityId")
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityId = lastHyphenIndex !== -1 ? communityParam.substring(lastHyphenIndex + 1) : communityParam;
  
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (communityId) {
      fetchCommunityAndOfferings();
    }
  }, [communityId]);

  const fetchCommunityAndOfferings = async () => {
    try {
      setLoading(true);
      
      // Fetch community details
      const communityResponse = await axios.get(`/api/communities/${communityId}`);
      if (communityResponse.data) {
        setCommunity(communityResponse.data);
      }

      // Fetch offerings for this community
      const offeringsResponse = await axios.get(`/api/offerings/community/${communityId}`);
      if (offeringsResponse.data) {
        setOfferings(offeringsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || offering.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getOfferingIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    
    switch (type.toLowerCase()) {
      case 'consultation':
        return (
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      case 'webinar':
        return (
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        );
      case 'package':
        return (
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.5 7.5V6c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2v1.5h2.5c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5V9c0-.83.67-1.5 1.5-1.5H7.5z"/>
            </svg>
          </div>
        );
      case 'class':
        return (
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
    }
  };

  const formatPrice = (offering: Offering) => {
    if (offering.is_free) {
      return { current: 'Free', original: null };
    }
    
    const discountedPrice = offering.discounted_price;
    const price = offering.price;
    
    let currentPrice = '0';
    let originalPrice = null;
    
    if (discountedPrice) {
      currentPrice = discountedPrice.toString();
      if (price) {
        originalPrice = price.amount.toString();
      }
    } else if (price) {
      currentPrice = price.amount.toString();
    }
    
    return { current: currentPrice, original: originalPrice };
  };

  const handleOfferingClick = (offering: Offering) => {
    router.push(`/community/${communityParam}/offerings/${offering._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offerings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {community?.name || 'Community'} Offerings
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredOfferings.length} offerings available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offerings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All Types
            </Button>
            <Button
              variant={selectedType === 'consultation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('consultation')}
            >
              Consultations
            </Button>
            <Button
              variant={selectedType === 'webinar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('webinar')}
            >
              Webinars
            </Button>
            <Button
              variant={selectedType === 'class' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('class')}
            >
              Classes
            </Button>
          </div>
        </div>

        {/* Offerings Grid/List */}
        {filteredOfferings.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredOfferings.map((offering) => {
              const { current: currentPrice, original: originalPrice } = formatPrice(offering);
              
              return (
                <Card
                  key={offering._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOfferingClick(offering)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getOfferingIcon(offering.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {offering.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {offering.type}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {offering.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{currentPrice}
                            </span>
                            {originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {offering.duration} min
                          </span>
                        </div>

                        {offering.provider && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {offering.provider.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {offering.provider.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offerings Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'This community hasn\'t created any offerings yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 