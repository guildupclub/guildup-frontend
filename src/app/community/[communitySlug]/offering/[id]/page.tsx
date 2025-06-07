"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import numbro from "numbro";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingDialog } from "@/components/booking/Bookingdialog";
import Loader from "@/components/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  MapPin, 
  Calendar,
  Award,
  Languages,
  CheckCircle,
  Share2,
  Heart,
  ChevronRight,
  Home
} from "lucide-react";
import { HiOutlineUserGroup, HiOutlineVideoCamera, HiOutlineArchive, HiOutlineBookOpen } from "react-icons/hi";
import { GrInstagram, GrYoga } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { MdOutlineClass, MdOutlineRssFeed, MdPeopleAlt } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa6";
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

interface Creator {
  user_name: string;
  user_email: string;
  user_avatar: string;
  about: string;
  user_isBankDetailsAdded: boolean;
  user_iscalendarConnected: boolean;
  user_year_of_experience: number;
  user_session_conducted: number;
  user_languages: string[];
}

interface Community {
  _id: string;
  name: string;
  num_member: number;
  post_count: number;
  description: string;
  is_locked: boolean;
  tags: string[];
  image: string;
  background_image: string;
  youtube_followers: string;
  instagram_followers: string;
  linkedin_followers: string;
}

const OfferingDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [offering, setOffering] = useState<Offering | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const offeringId = params?.id as string;
  const communitySlug = params?.communitySlug as string;

  // Extract community ID from slug (last part after the final dash)
  const getCommunityIdFromSlug = (slug: string) => {
    const parts = slug.split('-');
    return parts[parts.length - 1];
  };

  // Extract community name from slug (everything except the last part)
  const getCommunityNameFromSlug = (slug: string) => {
    const parts = slug.split('-');
    return parts.slice(0, -1).join(' ').replace(/-/g, ' ');
  };

  useEffect(() => {
    if (offeringId) {
      fetchOfferingDetails();
    }
  }, [offeringId]);

  const fetchOfferingDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch offering details
      const offeringResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/${offeringId}`
      );

      if (offeringResponse.data.r === "s") {
        const offeringData = offeringResponse.data.data;
        setOffering(offeringData);

        // Fetch community and creator details
        const communityResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
          { communityId: offeringData.community_id }
        );

        if (communityResponse.data.r === "s") {
          setCreator(communityResponse.data.data.user);
          setCommunity(communityResponse.data.data.community);
        }
      }
    } catch (error) {
      console.error("Error fetching offering details:", error);
      toast.error("Failed to load offering details");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!session) {
      signIn("google");
      return;
    }
    setShowBookingDialog(true);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const formatNumber = (num: any) => {
    if (!num) return "0";
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

  const typeToIcon: Record<string, { icon: React.ReactElement; label: string }> = {
    consultation: {
      icon: <HiOutlineUserGroup className="text-blue-600 w-6 h-6" />,
      label: "Consultation",
    },
    webinar: {
      icon: <HiOutlineVideoCamera className="text-purple-600 w-6 h-6" />,
      label: "Webinar",
    },
    package: {
      icon: <MdOutlineClass className="text-orange-600 w-6 h-6" />,
      label: "Package",
    },
    class: {
      icon: <GrYoga className="text-green-600 w-6 h-6" />,
      label: "Class",
    },
  };

  // Get community URL for navigation
  const getCommunityUrl = () => {
    if (!communitySlug) return '/dashboard/guild';
    return `/community/${communitySlug}/offerings`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!offering || !creator || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offering not found</h2>
          <p className="text-gray-600">The offering you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumbs */}
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
                <button 
                  onClick={() => router.push(getCommunityUrl())}
                  className="hover:text-gray-700 transition-colors"
                >
                  {community.name}
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">
                  {offering.title}
                </span>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 ${isLiked ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Offering Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {offering.type && typeToIcon[offering.type] && (
                    <div className="p-2 rounded-lg bg-blue-50">
                      {typeToIcon[offering.type].icon}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{offering.title}</h1>
                    <p className="text-gray-600">{typeToIcon[offering.type]?.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  {offering.is_free || Number(offering.discounted_price) === 0 ? (
                    <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                      Free
                    </Badge>
                  ) : (
                    <div className="text-right">
                      {offering.price?.amount && Number(offering.discounted_price) < offering.price.amount && (
                        <span className="text-sm text-gray-400 line-through block">
                          ₹{offering.price.amount}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{offering.discounted_price || offering.price?.amount}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{offering.duration} minutes</span>
                </div>
                {offering.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{offering.rating}/5 ({offering.total_ratings} reviews)</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">About this offering</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {offering.description}
                </p>
              </div>

              {offering.tags && offering.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {offering.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold mb-4">What's included</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>One-on-one session with {creator.user_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{offering.duration} minutes of dedicated time</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personalized guidance and advice</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Follow-up resources and recommendations</span>
                </div>
              </div>
            </motion.div>

            {/* Creator About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold mb-4">About the community</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {community.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6 sticky top-6"
            >
              <div className="text-center mb-6">
                {offering.is_free || Number(offering.discounted_price) === 0 ? (
                  <div className="text-3xl font-bold text-green-600 mb-2">Free</div>
                ) : (
                  <div className="mb-2">
                    {offering.price?.amount && Number(offering.discounted_price) < offering.price.amount && (
                      <span className="text-lg text-gray-400 line-through block">
                        ₹{offering.price.amount}
                      </span>
                    )}
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{offering.discounted_price || offering.price?.amount}
                    </div>
                  </div>
                )}
                <p className="text-gray-600">{offering.duration} minutes session</p>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">
                      <Button
                        onClick={handleBookNow}
                        disabled={!offering.is_free && !creator.user_isBankDetailsAdded}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                        size="lg"
                      >
                        {session ? 'Book Now' : 'Sign in to Book'}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!offering.is_free && !creator.user_isBankDetailsAdded && (
                    <TooltipContent>
                      <p>The expert is not accepting bookings at the moment</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <p className="text-center text-sm text-gray-500 mt-3">
                Instant confirmation • No hidden fees
              </p>
            </motion.div>

            {/* Creator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Meet your expert</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={creator.user_avatar} alt={creator.user_name} />
                  <AvatarFallback>{creator.user_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{creator.user_name}</h4>
                    {creator.user_isBankDetailsAdded && (
                      <RiVerifiedBadgeFill className="text-blue-600 h-5 w-5" />
                    )}
                  </div>
                  <button 
                    onClick={() => router.push(getCommunityUrl())}
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                  >
                    Community: {community.name}
                  </button>
                </div>
              </div>

              {creator.about && (
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {creator.about}
                </p>
              )}

              <div className="space-y-3">
                {creator.user_year_of_experience > 0 && (
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      <span className="font-medium">{creator.user_year_of_experience}+</span> years experience
                    </span>
                  </div>
                )}

                {creator.user_session_conducted > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-violet-500" />
                    <span className="text-sm">
                      <span className="font-medium">{creator.user_session_conducted}+</span> sessions conducted
                    </span>
                  </div>
                )}

                {creator.user_languages?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Languages className="h-4 w-4 text-teal-500" />
                    <div className="flex flex-wrap gap-1">
                      {creator.user_languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Community Stats */}
              <div className="border-t pt-4 mt-4">
                <h5 className="font-medium mb-3">Community stats</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Members</span>
                    <span className="font-medium">{formatNumber(community.num_member)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-medium">{community.post_count}</span>
                  </div>
                  
                  {community.instagram_followers && Number(community.instagram_followers) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <GrInstagram className="h-3 w-3 text-pink-500" />
                        Instagram
                      </span>
                      <span className="font-medium">{formatNumber(community.instagram_followers)}</span>
                    </div>
                  )}

                  {community.youtube_followers && Number(community.youtube_followers) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <BsYoutube className="h-3 w-3 text-red-500" />
                        YouTube
                      </span>
                      <span className="font-medium">{formatNumber(community.youtube_followers)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {showBookingDialog && offering && (
        <BookingDialog
          offering={{
            ...offering,
            discounted_price: offering.discounted_price
              ? Number(offering.discounted_price)
              : 0,
          }}
          isOpen={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
        />
      )}
    </div>
  );
};

export default OfferingDetailPage; 