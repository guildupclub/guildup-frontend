"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Search, Star, Users, MapPin, Clock, ChevronDown, MessageCircle, ArrowLeft, ArrowRight, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useSession } from 'next-auth/react';
import { PageTracker } from '@/components/analytics/PageTracker';
import CategoryBar from '@/components/explore/CategoryBar';
import FeaturedExperts from '@/components/explore/FeaturedExperts';
import Loader from '@/components/Loader';
import { useTracking } from '@/hooks/useTracking';
import axios from 'axios';
import { setUserFollowedCommunities } from '@/redux/userSlice';
import Footer from '@/components/layout/Footer';
import ExpertCard from '@/components/explore/ExpertCard';

interface Category {
  _id: string;
  name: string;
}

// Component to handle search params with Suspense
function SearchParamsProvider({
  children,
  onCategoryFromUrl,
}: {
  children: React.ReactNode;
  onCategoryFromUrl: (category: string | null) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const categoryFromUrl = searchParams?.get("category");
    onCategoryFromUrl(categoryFromUrl ?? null);
  }, [searchParams, onCategoryFromUrl]);

  return <>{children}</>;
}

const ExplorePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const tracking = useTracking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // State for filters
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');
  const [offeringType, setOfferingType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [duration, setDuration] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
        );

        const categoriesData = [
          { _id: "all", name: "All Category" },
          ...response.data.data,
        ];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategory();
  }, []);

  // Fetch user communities if logged in
  useEffect(() => {
    if (!isMounted || status === "loading") return;

    if (session) {
      const fetchCommunities = async () => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
            {
              userId: session?.user._id,
            }
          );
          dispatch(setUserFollowedCommunities(res.data.data));
        } catch (error) {
          console.error(error);
        }
      };
      fetchCommunities();
    }
  }, [session, status, isMounted, dispatch]);

  const fetchCommunities = useCallback(async (pageNum = 0) => {
    setLoadingCommunities(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(20),
        offeringType,
        priceRange,
        duration,
        sortBy,
      });
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?${params.toString()}`
      );
      const newCommunities = res.data.data || [];
      setCommunities(prev => pageNum === 0 ? newCommunities : [...prev, ...newCommunities]);
      setHasMore(newCommunities.length > 0);
    } finally {
      setLoadingCommunities(false);
    }
  }, [offeringType, priceRange, duration, sortBy]);

  useEffect(() => {
    setPage(0);
    fetchCommunities(0);
  }, [offeringType, priceRange, duration, sortBy, fetchCommunities]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loadingCommunities &&
        hasMore
      ) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchCommunities(nextPage);
          return nextPage;
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingCommunities, hasMore, fetchCommunities]);

  const categoryToUrl = (name: string) => {
    return name.replace(/\s+/g, "-");
  };

  const urlToCategory = (url: string) => {
    return url.replace(/-/g, " ");
  };

  const handleCategoryFromUrl = useCallback(
    (categoryFromUrl: string | null) => {
      if (categoryFromUrl && categories.length > 0) {
        const categoryName = urlToCategory(categoryFromUrl);
        const categoryObj = categories.find(
          (cat: Category) =>
            cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (categoryObj) {
          setSelectedCategory(categoryObj.name);
          setSelectedCategoryId(categoryObj._id);
        }
      }
    },
    [categories]
  );

  // Update URL when category changes
  useEffect(() => {
    if (!categories.length) return;

    if (selectedCategory === "All Category") {
      router.replace("/explore", { scroll: false });
    } else {
      router.replace(`/explore?category=${categoryToUrl(selectedCategory)}`, {
        scroll: false,
      });
    }
  }, [selectedCategory, router, categories]);

  const handleCategorySelect = (categoryId: string) => {
    const selectedCat = categories.find(
      (cat: Category) => cat._id === categoryId
    );

    tracking.trackClick("category_filter", {
      category_id: categoryId,
      category_name: selectedCat?.name || "All Category",
      previous_category: selectedCategory,
      user_id: session?.user._id,
    });

    setIsLoading(true);

    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
    }

    if (targetRef.current) {
      const headerOffset = 145;
      const elementPosition = targetRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setIsLoading(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      tracking.trackClick("explore_search", {
        search_query: searchQuery.trim(),
        user_id: session?.user._id,
      });
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Popular categories for the bottom section
  const popularCategories = [
    {
      name: 'Fitness & Yoga',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '🧘',
      iconBg: 'bg-pink-100',
      cardBg: 'bg-gradient-to-b from-white to-pink-50',
      textColor: 'text-gray-900'
    },
    {
      name: 'Nutrition and Diet',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '🍎',
      iconBg: 'bg-pink-100',
      cardBg: 'bg-gradient-to-b from-white to-pink-50',
      textColor: 'text-primary',
      isSelected: false
    },
    {
      name: 'Relationship and Parenting',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '👨‍👩‍👧‍👦',
      iconBg: 'bg-orange-100',
      cardBg: 'bg-gradient-to-b from-white to-orange-50',
      textColor: 'text-gray-900'
    },
    {
      name: 'Mental Health',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '🧠',
      iconBg: 'bg-purple-100',
      cardBg: 'bg-gradient-to-b from-white to-purple-50',
      textColor: 'text-gray-900'
    },
    {
      name: 'Personal Growth',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '📈',
      iconBg: 'bg-blue-100',
      cardBg: 'bg-gradient-to-b from-white to-blue-50',
      textColor: 'text-gray-900'
    },
    {
      name: 'Others',
      description: 'Orci purus blandit non sollicitudin arcu blandit. Netus diam ut lacus arcu enim.',
      icon: '🔷',
      iconBg: 'bg-blue-100',
      cardBg: 'bg-gradient-to-b from-white to-blue-50',
      textColor: 'text-gray-900'
    }
  ];

  // Popular sub categories for the bottom section
  const popularSubCategories = [
    {
      name: 'Weight loss',
      icon: '🏃‍♂️',
      isSelected: false
    },
    {
      name: 'Diabetes',
      icon: '🩸',
      isSelected: false
    },
    {
      name: 'Cholesterol',
      icon: '💧',
      isSelected: false
    },
    {
      name: 'Muscle building',
      icon: '💪',
      isSelected: false
    },
    {
      name: 'PCOS',
      icon: '🌸',
      isSelected: false
    },
    {
      name: 'Thyroid',
      icon: '🦋',
      isSelected: false
    }
  ];

  if (!isMounted || status === "loading") {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchParamsProvider onCategoryFromUrl={handleCategoryFromUrl}>
        <div className="min-h-screen bg-white">
          {/* Header Section */}
          <div className="bg-white pt-8 pb-6">
            <div className="container mx-auto px-6">
              {/* Title */}
              <motion.h1 
                className="text-4xl md:text-5xl text-primary font-semibold mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Explore GuildUp
              </motion.h1>

              {/* Search Bar */}
              <motion.div 
                className="flex gap-3 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-md"
                >
                  Search Now
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Featured Experts Section */}
          <div className="bg-white py-8">
            <div className="container mx-auto px-6">
              <div className="w-full" ref={targetRef}>
                <div
                  id="scroll-target-border"
                  className="w-full h-1 mb-4 sm:mb-8"
                ></div>
                <FeaturedExperts />
              </div>
            </div>
          </div>

          {/* Popular Categories Section */}
          <div className="bg-white py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Categories</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`relative p-6 rounded-lg ${category.cardBg} hover:shadow-lg transition-all duration-300 cursor-pointer group ${category.isSelected ? 'ring-2 ring-primary' : ''}`}>
                      {/* External link icon for selected card */}
                      {category.isSelected && (
                        <div className="absolute top-4 right-4 text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-4">
                        {/* Icon Container */}
                        <div className={`w-12 h-12 ${category.iconBg} rounded-lg flex items-center justify-center text-2xl`}>
                          {category.icon}
                        </div>
                        
                        {/* Content */}
                        <div>
                          <h3 className={`text-lg font-bold ${category.textColor} mb-2 group-hover:scale-105 transition-transform duration-200`}>
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Call-to-Action Banner Section */}
          <div className="bg-white py-16">
            <div className="container mx-auto px-6">
              <motion.div 
                className="relative bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 md:p-12 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Background Phone Icons */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-10">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-10">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                
                {/* Content */}
                <div className="relative text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Find Your Clarity in 15 Mins – Book a Discovery Call
                  </h2>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-gray-100 border-2 border-blue-600 px-8 py-3 text-lg font-semibold rounded-lg"
                    onClick={() => window.open('/booking', '_blank')}
                  >
                    Book a Call
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Popular Sub Categories Section */}
          <div className="bg-gradient-to-b from-primary/2 to-white py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Sub categories</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularSubCategories.map((subCategory, index) => (
                  <motion.div
                    key={subCategory.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-300 cursor-pointer group ${subCategory.isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'}`}>
                      {/* External link icon for selected card */}
                      {subCategory.isSelected && (
                        <div className="absolute top-3 right-3 text-primary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        {/* Icon */}
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          {subCategory.icon}
                        </div>
                        
                        {/* Text */}
                        <span className={`font-medium ${subCategory.isSelected ? 'text-primary' : 'text-gray-900'} group-hover:scale-105 transition-transform duration-200`}>
                          {subCategory.name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          {/* Communities Section */}
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">All Communities</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <select
                    value={offeringType}
                    onChange={e => setOfferingType(e.target.value)}
                    className="border rounded px-3 py-1 text-sm pl-8 focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Offering Type</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Course">Course</option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Freelance Services">Freelance Services</option>
                  </select>
                  <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                </div>
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                    className="border rounded px-3 py-1 text-sm pl-8 focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Price Range</option>
                    <option value="Free">Free</option>
                    <option value="₹0 - ₹500">₹0 - ₹500</option>
                    <option value="₹500 - ₹1000">₹500 - ₹1000</option>
                    <option value="₹1000+">₹1000+</option>
                  </select>
                  <HelpCircle className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                </div>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="border rounded px-3 py-1 text-sm pl-8 focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Duration</option>
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min+">90 min+</option>
                  </select>
                  <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="border rounded px-3 py-1 text-sm pl-8 focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="relevance">Sort by</option>
                    <option value="rating">Rating</option>
                    <option value="price: low to high">Price: Low to High</option>
                    <option value="price: high to low">Price: High to Low</option>
                    <option value="experience">Experience</option>
                    <option value="newest">Newest</option>
                  </select>
                  <SlidersHorizontal className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communities.map((communityObj, idx) => (
                <ExpertCard
                  key={communityObj.community ? communityObj.community._id : communityObj._id}
                  expert={{
                    name: communityObj.community ? communityObj.community.name : communityObj.name,
                    specialty: communityObj.community ? communityObj.community.description : communityObj.description || '',
                    rating: 5,
                    sessions: communityObj.community ? communityObj.community.owner_sessions : communityObj.owner_sessions || 0,
                    avatar: communityObj.community ? communityObj.community.image : communityObj.image || '/avatar-placeholder.png',
                    verified: true,
                    available: true,
                    url: `/community/${communityObj.community ? communityObj.community._id : communityObj._id}`,
                    languages: communityObj.community ? communityObj.community.owner_languages : communityObj.owner_languages || [],
                    experience: String((communityObj.community ? communityObj.community.owner_experience : communityObj.owner_experience) || '1'),
                    nextSlot: 'Tomorrow',
                    price: '0',
                    originalPrice: '',
                    consultation: '',
                    skills: communityObj.community ? communityObj.community.tags : communityObj.tags || [],
                  }}
                  index={idx % 2}
                  currentIndex={idx}
                />
              ))}
            </div>
            {loadingCommunities && (
              <div className="flex justify-center py-6">
                <Loader />
              </div>
            )}
            {!hasMore && communities.length > 0 && (
              <div className="text-center text-gray-400 py-4">No more communities to load.</div>
            )}
          </div>
        </div>
        
        <PageTracker
          pageName="Explore"
          pageCategory="discovery"
          metadata={{
            selected_category: selectedCategory,
            selected_category_id: selectedCategoryId,
            user_signed_in: !!session,
            user_id: session?.user._id,
            is_creator: session?.user?.is_creator,
            categories_count: categories.length,
            is_loading: isLoading,
          }}
          trackScrollDepth={true}
          trackTimeOnPage={true}
          trackClicks={true}
        />
      </SearchParamsProvider>
    </Suspense>
  );
};

export default ExplorePage; 