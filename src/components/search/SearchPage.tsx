"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import PostCard from "./PostCard";
import CommunityCard from "./CommunityCard";
import ExpertCard from "../explore/ExpertCard";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/constants";
import { StringConstants } from "../common/CommonText";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Input } from "@/components/ui/input";
import { Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryNavbar } from "@/components/layout/CategoryNavbar";
import axios from "axios";

interface Category {
  _id: string;
  name: string;
}

interface Community {
  _id: string;
  name: string;
  user_id: string;
  description: string;
  imageUrl: string;
  image: string;
  background_image: string;
  user_isBankDetailsAdded: boolean;
  user_iscalendarConnected: boolean;
}

interface Expert {
  name: string;
  specialty: string;
  rating: number;
  sessions: number;
  avatar: string;
  verified: boolean;
  available: boolean;
  url: string;
  languages: string[];
  experience: string;
  nextSlot: string;
  price: string;
  originalPrice: string;
  consultation: string;
  skills: string[];
}

function SearchPageContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Helper functions for URL conversion
  const categoryToUrl = (name: string) => {
    return name.replace(/\s+/g, "-");
  };

  const urlToCategory = (url: string) => {
    return url.replace(/-/g, " ");
  };

  // Function to map community data to Expert format
  const mapCommunityToExpert = (result: any): Expert => {
    console.log('Mapping result:', result);
    
    // Handle both direct community data and nested structure
    const community = result.community || result;
    const offerings = result.offerings || [];
    
    console.log('Community data:', community);
    console.log('Offerings data:', offerings);
    
    // Get the best offering for pricing
    const bestOffering = offerings.length > 0 ? offerings[0] : null;
    const price = bestOffering?.discounted_price || bestOffering?.price?.amount || '0';
    const originalPrice = bestOffering?.price?.amount || price;
    
    // Clean community name for URL (following the same pattern as other components)
    const cleanedCommunityName = community.name
      ? community.name
          .replace(/\s+/g, "-")
          .replace(/\|/g, "-")
          .replace(/-+/g, "-")
      : "community";
    const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
    
    const expert = {
      name: community.name || 'Unknown Community',
      specialty: community.description || 'Join this amazing community',
      rating: 5.0, // Default rating since it's not in community data
      sessions: community.owner_sessions || community.num_member || 100,
      avatar: community.image || community.icon || community.imageUrl || 'https://via.placeholder.com/112x128?text=Community',
      verified: true,
      available: true,
      url: `/community/${encodedCommunityName}-${community._id}/profile`,
      languages: community.owner_languages || ['English', 'Hindi'], // Default languages
      experience: community.owner_experience?.toString() || '5',
      nextSlot: 'Tomorrow',
      price: price === '0' ? 'Free' : `₹${price}`,
      originalPrice: originalPrice === '0' ? 'Free' : `₹${originalPrice}`,
      consultation: bestOffering?.title || community.category?.name || 'Community Access',
      skills: community.tags || (community.category ? [community.category.name] : ['Community'])
    };
    
    console.log('Mapped expert:', expert);
    return expert;
  };

  // Handle URL parameters on mount and when they change
  useEffect(() => {
    const queryFromUrl = searchParams?.get("q") || "";
    const categoryFromUrl = searchParams?.get("category") || "";
    
    // Handle search query from URL
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
    
    // Handle category from URL - expecting category ID
    if (categories.length > 0) {
      if (categoryFromUrl) {
        // The categoryFromUrl is now the category ID
        const categoryObj = categories.find(
          (cat: Category) => cat._id === categoryFromUrl
        );
        if (categoryObj && categoryObj._id !== selectedCategoryId) {
          setSelectedCategory(categoryObj.name);
          setSelectedCategoryId(categoryObj._id);
        }
      } else if (selectedCategoryId !== "all") {
        // Reset to "All Category" if no category in URL
        setSelectedCategory("All Category");
        setSelectedCategoryId("all");
      }
    }
    
    // Perform search when we have query and categories are loaded
    if (queryFromUrl && categories.length > 0 && !isInitialLoad) {
      const finalCategoryId = categoryFromUrl || "all";
      performSearch(queryFromUrl, finalCategoryId);
    }
    
    if (isInitialLoad && categories.length > 0) {
      setIsInitialLoad(false);
    }
  }, [searchParams, categories, isInitialLoad]);

  // Dynamic search function with debouncing
  const performSearch = useCallback(async (query: string, categoryId?: string) => {
    setLoading(true);

    try {
      let searchUrl: string;
      let searchParams: URLSearchParams;
      
      // Always use the search API for consistent category filtering
      if (query.trim() && query !== "*") {
        // Real search query
        searchParams = new URLSearchParams({
          q: query.trim(),
        });
      } else {
        // Use wildcard search for category-only or all communities
        searchParams = new URLSearchParams({
          q: "*", // Use wildcard to get all communities
        });
      }

      // Add category filter if not "All Category"
      if (categoryId && categoryId !== 'all') {
        searchParams.append('category', categoryId);
        console.log('SearchPage - Adding category filter:', categoryId);
      }

      searchUrl = `/api/search?${searchParams.toString()}`;

      console.log('Search URL:', searchUrl);

      const response = await axios.get(searchUrl);
      console.log('Search response:', response.data);

      // Handle the backend response format { r: "s", data: [...] }
      let searchResults = [];
      if (response.data && response.data.r === "s" && response.data.data) {
        searchResults = response.data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Fallback for direct data array
        searchResults = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for when response.data is directly an array
        searchResults = response.data;
      }
      
      console.log('Processed search results:', searchResults);
      console.log('First result structure:', searchResults[0]);
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
        );
        const categoriesData = [
          { _id: "all", name: "All Category" },
          ...response.data.data,
        ];
        setCategories(categoriesData);
        
                 // After categories are loaded, check if we need to perform initial search
         const queryFromUrl = searchParams?.get("q") || "";
         const categoryFromUrl = searchParams?.get("category") || "";
         
         if (queryFromUrl || categoryFromUrl) {
           let categoryId = "all";
           
           if (categoryFromUrl) {
             // The categoryFromUrl is now the category ID
             categoryId = categoryFromUrl;
           }
           
           if (queryFromUrl) {
             performSearch(queryFromUrl, categoryId);
           } else if (categoryId !== "all") {
             performSearch("*", categoryId);
           }
         } else {
           // If no search query and no category, show all communities
           performSearch("*", "all");
         }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, [searchParams, performSearch]);

  // Handle dynamic search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Update URL immediately for better UX
    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('q', value.trim());
    }
    if (selectedCategoryId !== 'all') {
      params.set('category', selectedCategoryId);
    }
    const queryString = params.toString();
    const url = queryString ? `/search?${queryString}` : '/search';
    router.replace(url, { scroll: false });

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      performSearch(value, selectedCategoryId);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };



  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const selectedCat = categories.find((cat: Category) => cat._id === categoryId);

    console.log('=== CATEGORY SELECTION DEBUG ===');
    console.log('Category selected:', categoryId, selectedCat);
    console.log('Current state - selectedCategory:', selectedCategory, 'selectedCategoryId:', selectedCategoryId);
    console.log('All categories:', categories.map(cat => ({ id: cat._id, name: cat.name })));
    console.log('=== END DEBUG ===');

    // Update state
    if (selectedCat) {
      console.log('Setting category to:', selectedCat.name, selectedCat._id);
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else {
      console.log('Resetting to All Category');
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
    }

    // Update URL with new category - using category ID for API calls
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedCat && selectedCat.name !== "All Category") {
      params.set('category', selectedCat._id); // Store category ID for API calls
    }
    const queryString = params.toString();
    const url = queryString ? `/search?${queryString}` : '/search';
    console.log('Updating URL to:', url);
    router.replace(url, { scroll: false });

    // Always perform search when category changes (even without search query)
    if (searchQuery.trim()) {
      console.log('Performing search with query:', searchQuery, 'categoryId:', categoryId);
      performSearch(searchQuery, categoryId);
    } else {
      // If no search query, perform category-only search
      console.log('Performing category-only search with categoryId:', categoryId);
      performSearch("*", categoryId); // Use "*" as wildcard for category-only search
    }
  };

  // Handle community click with Redux
  const handleClickCommunity = useCallback(
    (communityData: { community: Community }) => {
      if (!communityData.community || !communityData.community._id) {
        console.error("Invalid community data:", communityData);
        return;
      }

      // Clean and encode community name for URL
      const cleanedCommunityName = communityData.community.name
        ? communityData.community.name
            .replace(/\s+/g, "-")
            .replace(/\|/g, "-")
            .replace(/-+/g, "-")
        : "";
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityData.community._id}`;

      // Navigate to community profile page
      router.push(`/community/${communityParams}/profile`);

      // Update Redux state
      dispatch(
        setCommunityData({
          communityId: communityData.community._id,
          userId: communityData.community.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: communityData.community._id,
          name: communityData.community.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false
        })
      );
    },
    [dispatch, router]
  );

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory("All Category");
    setSelectedCategoryId("all");
    router.replace('/search', { scroll: false });
    // Show all communities after clearing
    performSearch("*", "all");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

    return (
    <div className=" bg-white">
      {/* Header Section */}
      <div className="bg-white text-primary pt-4 md:pt-8 pb-4 md:pb-6 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h1 
            className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Search Experts
          </motion.h1>

          {/* Search Bar */}
          <motion.div 
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              <Input
                type="text"
                placeholder="Search Experts..."
                className="pl-10 pr-10 py-2 md:py-3 text-base md:text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Search Stats */}
          <motion.div 
            className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* <p className="text-xs md:text-sm text-gray-600">
              {loading 
                ? 'Loading...' 
                : searchQuery 
                  ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for "${searchQuery}"`
                  : selectedCategoryId !== "all"
                    ? `${results.length} ${results.length === 1 ? 'community' : 'communities'} in ${selectedCategory}`
                    : `${results.length} ${results.length === 1 ? 'community' : 'communities'} available`
              }
            </p> */}
            {selectedCategory !== 'All Category' && (
              <Badge variant="secondary" className="text-xs w-fit">
                Category: {selectedCategory}
              </Badge>
            )}
          </motion.div>
        </div>
      </div>

      {/* Category Navbar */}
      {categories.length > 0 && (
        <CategoryNavbar 
          categories={categories}
          activeCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      )}

             {/* Results Section */}
       <div className="bg-white container mx-auto px-4 md:px-6 py-4 md:py-8">
         <AnimatePresence mode="wait">
           {/* Loading State */}
           {loading && (
             <motion.div 
               key="loading"
               className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="bg-primary/5 rounded-lg p-4 md:p-6">
                   <div className="flex gap-3 md:gap-4 mb-3 md:mb-4">
                     <Skeleton className="w-20 h-24 md:w-28 md:h-32 rounded-lg flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <Skeleton className="h-5 md:h-6 w-3/4 mb-2" />
                       <Skeleton className="h-3 md:h-4 w-full mb-1 md:mb-2" />
                       <Skeleton className="h-3 md:h-4 w-2/3 mb-1 md:mb-2" />
                       <Skeleton className="h-3 md:h-4 w-1/2" />
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                     <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
                     <Skeleton className="h-5 md:h-6 w-16 md:w-20 rounded-full" />
                   </div>
                   <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                     <Skeleton className="h-6 md:h-8 w-full" />
                     <Skeleton className="h-6 md:h-8 w-full" />
                     <Skeleton className="h-6 md:h-8 w-full" />
                   </div>
                   <Skeleton className="h-8 md:h-10 w-full rounded-md" />
                 </div>
               ))}
             </motion.div>
           )}

                     

                                {/* No Results State */}
           {!loading && results.length === 0 && (
             <motion.div 
               key="no-results"
               className="text-center py-8 md:py-16 px-4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
             >
               <Users className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-gray-300" />
               <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                 No Experts found, Please use a different category.
               </h2>
               <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4 px-2">
                 {searchQuery.trim() 
                   ? `No results for "${searchQuery}" ${selectedCategory !== 'All Category' ? `in ${selectedCategory}` : ''}`
                   : `No communities found in ${selectedCategory}`
                 }
               </p>
               <Button
                 onClick={clearSearch}
                 variant="outline"
                 className="text-sm"
               >
                 Clear search
               </Button>
             </motion.div>
           )}

                                                                                                                                   {/* Results */}
             {!loading && results.length > 0 && (
              <div>
                <motion.div 
                  key="results"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {results.map((result, index) => {
                    console.log(`Rendering result ${index}:`, result);
                    try {
                      const expert = mapCommunityToExpert(result);
                      console.log(`Mapped expert ${index}:`, expert);
                      return (
                        <motion.div
                          key={result._id || result.community?._id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ExpertCard
                            expert={expert}
                            index={index}
                            currentIndex={0}
                          />
                        </motion.div>
                      );
                    } catch (error) {
                      console.error('Error mapping result:', error, result);
                      return (
                        <div key={index} className="border border-red-200 bg-red-50 p-3 md:p-4 rounded-lg">
                          <p className="text-red-600 text-sm">That is not you, that is us. We are working on it.</p>
                          <pre className="text-xs text-red-500 mt-2 overflow-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                  })}
                </motion.div>
              </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
