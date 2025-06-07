"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import numbro from "numbro";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Loader from "@/components/Loader";

// Icons
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Home
} from "lucide-react";
import { HiOutlineUserGroup, HiOutlineVideoCamera } from "react-icons/hi";
import { GrYoga } from "react-icons/gr";
import { MdOutlineClass } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price: string;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
  community_id: string;
}

interface Community {
  _id: string;
  name: string;
  description: string;
  image: string;
  background_image: string;
  num_member: number;
  post_count: number;
  tags: string[];
}

interface Creator {
  user_name: string;
  user_avatar: string;
  user_isBankDetailsAdded: boolean;
}

const CommunityOfferingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const communitySlug = params?.communitySlug as string;

  // Extract community ID from slug (last part after the final dash)
  const getCommunityIdFromSlug = (slug: string) => {
    const parts = slug.split('-');
    return parts[parts.length - 1];
  };

  // Extract community name from slug (everything except the last part)
  const getCommunityNameFromSlug = (slug: string) => {
    const parts = slug.split('-');
    return parts.slice(0, -1).join('-');
  };

  useEffect(() => {
    if (communitySlug) {
      const communityId = getCommunityIdFromSlug(communitySlug);
      fetchCommunityData(communityId);
      fetchOfferings(communityId);
    }
  }, [communitySlug]);

  const fetchCommunityData = async (communityId: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        { communityId }
      );

      if (response.data.r === "s") {
        setCommunity(response.data.data.community);
        setCreator(response.data.data.user);
      }
    } catch (error) {
      console.error("Error fetching community data:", error);
      toast.error("Failed to load community data");
    }
  };

  const fetchOfferings = async (communityId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${communityId}`
      );

      if (response.data.r === "s") {
        setOfferings(response.data.data || []);
      } else {
        setOfferings([]);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
      toast.error("Failed to load offerings");
      setOfferings([]);
    } finally {
      setLoading(false);
    }
  };

  const typeToIcon: Record<string, { icon: React.ReactElement; label: string; color: string }> = {
    consultation: {
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      label: "Consultation",
      color: "text-blue-600",
    },
    webinar: {
      icon: <HiOutlineVideoCamera className="w-5 h-5" />,
      label: "Webinar",
      color: "text-purple-600",
    },
    package: {
      icon: <MdOutlineClass className="w-5 h-5" />,
      label: "Package",
      color: "text-orange-600",
    },
    class: {
      icon: <GrYoga className="w-5 h-5" />,
      label: "Class",
      color: "text-green-600",
    },
  };

  const filteredOfferings = offerings.filter((offering) => {
    const matchesSearch = offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || offering.type === typeFilter;
    
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && (offering.is_free || Number(offering.discounted_price) === 0)) ||
                        (priceFilter === "paid" && !offering.is_free && Number(offering.discounted_price) > 0);
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const handleOfferingClick = (offering: Offering) => {
    router.push(`/community/${communitySlug}/offering/${offering._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Community not found</h2>
          <p className="text-gray-600">The community you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <button 
                  onClick={() => router.push('/')}
                  className="hover:text-gray-700 transition-colors"
                >
                  <Home className="h-4 w-4" />
                </button>
                <ChevronRight className="h-3 w-3" />
                <button 
                  onClick={() => router.push('/dashboard/guild')}
                  className="hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">
                  {community.name} Offerings
                </span>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="flex items-center gap-2"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                {viewMode === "grid" ? "List" : "Grid"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={community.image} alt={community.name} />
              <AvatarFallback className="text-2xl">{community.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                {creator?.user_isBankDetailsAdded && (
                  <RiVerifiedBadgeFill className="text-blue-600 h-6 w-6" />
                )}
              </div>
              <p className="text-gray-600 mb-4">{community.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{numbro(community.num_member).format({ average: true, mantissa: 1 }).toUpperCase()} members</span>
                </div>
                <div>
                  <span>{offerings.length} offerings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search offerings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Offerings Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredOfferings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No offerings found</h3>
            <p className="text-gray-600">
              {searchQuery || typeFilter !== "all" || priceFilter !== "all" 
                ? "Try adjusting your filters or search query."
                : "This community hasn't created any offerings yet."
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredOfferings.map((offering, index) => (
              <motion.div
                key={offering._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleOfferingClick(offering)}
                className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
                  viewMode === "list" ? "flex items-center p-4" : "p-6"
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {offering.type && typeToIcon[offering.type] && (
                          <div className={`p-2 rounded-lg bg-blue-50 ${typeToIcon[offering.type].color}`}>
                            {typeToIcon[offering.type].icon}
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {typeToIcon[offering.type]?.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {offering.is_free || Number(offering.discounted_price) === 0 ? (
                          <Badge className="bg-green-100 text-green-800">Free</Badge>
                        ) : (
                          <div>
                            {offering.price?.amount && Number(offering.discounted_price) < offering.price.amount && (
                              <span className="text-sm text-gray-400 line-through block">
                                ₹{offering.price.amount}
                              </span>
                            )}
                            <span className="text-lg font-bold text-gray-900">
                              ₹{offering.discounted_price || offering.price?.amount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {offering.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {offering.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{offering.duration} min</span>
                      </div>
                      {offering.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{offering.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mr-4">
                      {offering.type && typeToIcon[offering.type] && (
                        <div className={`p-2 rounded-lg bg-blue-50 ${typeToIcon[offering.type].color}`}>
                          {typeToIcon[offering.type].icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {offering.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {typeToIcon[offering.type]?.label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                        {offering.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{offering.duration} min</span>
                        </div>
                        {offering.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{offering.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {offering.is_free || Number(offering.discounted_price) === 0 ? (
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                      ) : (
                        <div>
                          {offering.price?.amount && Number(offering.discounted_price) < offering.price.amount && (
                            <span className="text-sm text-gray-400 line-through block">
                              ₹{offering.price.amount}
                            </span>
                          )}
                          <span className="text-lg font-bold text-gray-900">
                            ₹{offering.discounted_price || offering.price?.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityOfferingsPage; 