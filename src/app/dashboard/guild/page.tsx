"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  ExternalLink,
  Crown,
  UserPlus,
  TrendingUp,
  MessageSquare,
  Share2,
  Edit,
  BarChart3,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import CreatorForm from "@/components/form/CreatorForm";
import { FaEdit } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdPeopleAlt, MdOutlineRssFeed } from "react-icons/md";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { FaLinkedinIn } from "react-icons/fa6";
import Testimonials from "@/components/testimonial/Testimonial";
import { EditCommunityModal } from "@/components/form/editCommunity";
import { AddOfferingDialog } from "@/components/profile/AddOfferingdialog";

interface Community {
  _id: string;
  name: string;
  description: string;
  image?: string;
  background_image?: string;
  member_count?: number;
  num_member?: number;
  created_at?: string;
  category?: string;
  is_owner?: boolean;
  user_id?: string;
  owner_name?: string;
  post_count?: number;
  tags?: string[];
  youtube_followers?: string;
  instagram_followers?: string;
  linkedin_followers?: string;
}

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

interface GuildStats {
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
  totalEngagement: number;
}

const MyGuildDashboard = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [showCreatorForm, setShowCreatorForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAddOfferingModal, setShowAddOfferingModal] = useState(false);
  const [offeringForm, setOfferingForm] = useState({
    title: "",
    description: "",
    type: "consultation",
    price: 0,
    duration: 60,
    is_free: true
  });

  const [stats, setStats] = useState<GuildStats>({
    totalCommunities: 0,
    totalMembers: 0,
    totalPosts: 0,
    totalEngagement: 0
  });

  useEffect(() => {
    fetchUserCommunities();
  }, [user]);

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityOfferings(selectedCommunity._id);
    }
  }, [selectedCommunity]);

  const fetchUserCommunities = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      
      const ownedResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/owned`,
        { userId: user._id }
      );
      
      const joinedResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
        { userId: user._id }
      );

      let ownedCommunitiesData: Community[] = [];
      let joinedCommunitiesData: Community[] = [];

      if (ownedResponse.data?.r === "s") {
        ownedCommunitiesData = (ownedResponse.data.data || []).map((c: Community) => ({ 
          ...c, 
          is_owner: true,
          member_count: c.num_member || 0
        }));
        setOwnedCommunities(ownedCommunitiesData);
      }

      if (joinedResponse.data?.r === "s") {
        const joinedData = joinedResponse.data.data || [];
        joinedCommunitiesData = joinedData
          .filter((c: Community) => c && !ownedCommunitiesData.some(owned => owned._id === c._id))
          .map((c: Community) => ({ 
            ...c, 
            is_owner: false,
            member_count: c.num_member || 0
          }));
        setJoinedCommunities(joinedCommunitiesData);
      }

      const allCommunities = [...ownedCommunitiesData, ...joinedCommunitiesData];
      setCommunities(allCommunities);

      if (allCommunities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(allCommunities[0]);
      }

      const totalMembers = allCommunities.reduce((sum, c) => sum + (c.member_count || c.num_member || 0), 0);
      setStats({
        totalCommunities: allCommunities.length,
        totalMembers,
        totalPosts: Math.floor(totalMembers * 2.3),
        totalEngagement: Math.floor(totalMembers * 1.8)
      });

    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityOfferings = async (communityId: string) => {
    try {
      setOfferingsLoading(true);
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
      setOfferings([]);
    } finally {
      setOfferingsLoading(false);
    }
  };

  const formatNumber = (num: any) => {
    const numVal = Number(num);
    if (isNaN(numVal)) return "0";
    
    if (numVal >= 1000000) {
      return (numVal / 1000000).toFixed(1) + "M";
    } else if (numVal >= 1000) {
      return (numVal / 1000).toFixed(1) + "K";
    } else {
      return numVal.toString();
    }
  };

  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunity(community);
  };

  const handleCreateCommunity = () => {
    setShowCreatorForm(true);
  };

  const handleCreatorFormClose = () => {
    setShowCreatorForm(false);
  };

  const handleCreatorFormSuccess = () => {
    setShowCreatorForm(false);
    fetchUserCommunities();
  };

  const handleShareCommunity = async (community: Community) => {
    try {
      const cleanedCommunityName = community.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${community._id}`;
      const shareUrl = `${window.location.origin}/community/${communityParams}/profile`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Community link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleVisitCommunity = (community: Community) => {
    const cleanedCommunityName = community.name
      .replace(/\s+/g, "-")
      .replace(/\|/g, "-")
      .replace(/-+/g, "-");
    const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
    const communityParams = `${encodedCommunityName}-${community._id}`;
    
    router.push(`/community/${communityParams}/profile`);
  };

  const handleOfferingAdded = () => {
    if (selectedCommunity) {
      fetchCommunityOfferings(selectedCommunity._id);
    }
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity || !user?._id) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/create`,
        {
          userId: user._id,
          communityId: selectedCommunity._id,
          title: offeringForm.title,
          description: offeringForm.description,
          type: offeringForm.type,
          price: {
            amount: offeringForm.is_free ? 0 : offeringForm.price,
            currency: "INR"
          },
          discounted_price: offeringForm.is_free ? 0 : offeringForm.price,
          duration: offeringForm.duration,
          is_free: offeringForm.is_free,
          tags: []
        }
      );

      if (response.data.r === "s") {
        toast.success("Offering created successfully!");
        setShowAddOfferingModal(false);
        setOfferingForm({
          title: "",
          description: "",
          type: "consultation",
          price: 0,
          duration: 60,
          is_free: true
        });
        handleOfferingAdded();
      } else {
        toast.error("Failed to create offering");
      }
    } catch (error) {
      console.error("Error creating offering:", error);
      toast.error("Failed to create offering");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4 md:p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!loading && ownedCommunities.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Welcome to Your Guild
          </h1>
          <p className="text-gray-600 mb-8">
            Create your first community to access the guild dashboard and start building your audience.
          </p>
          <Button 
            onClick={handleCreateCommunity} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Community
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Communities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-6 pt-4"
      >
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {communities.map((community, index) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => handleCommunitySelect(community)}
              className="flex-shrink-0 cursor-pointer transition-all hover:scale-110"
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-full border-2 transition-all ${
                  selectedCommunity?._id === community._id
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-blue-400'
                } bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center`}>
                  {community.image ? (
                    <Image
                      src={community.image}
                      alt={community.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <Users className="h-8 w-8 text-white" />
                  )}
                </div>
                {community.is_owner && (
                  <Crown className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 bg-white rounded-full p-0.5" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Guild
          </h1>
          <p className="text-gray-800 text-sm md:text-base font-medium">
            Manage your communities and guild activities
          </p>
        </div>
        <Button 
          onClick={handleCreateCommunity} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 py-4"
      >
        {[
          {
            title: "Communities",
            value: stats.totalCommunities.toString(),
            description: `${ownedCommunities.length} owned`,
            icon: Users,
            color: "from-blue-500 to-blue-600"
          },
          {
            title: "Members",
            value: formatNumber(stats.totalMembers),
            description: "Total reach",
            icon: UserPlus,
            color: "from-green-500 to-green-600"
          },
          {
            title: "Posts",
            value: formatNumber(stats.totalPosts),
            description: "Content created",
            icon: MessageSquare,
            color: "from-purple-500 to-purple-600"
          },
          {
            title: "Engagement",
            value: formatNumber(stats.totalEngagement),
            description: "Interactions",
            icon: TrendingUp,
            color: "from-orange-500 to-orange-600"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="p-4 border border-gray-200 transition-colors hover:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-700 font-medium">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600 font-medium">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Community Details */}
      {selectedCommunity ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-6 py-4"
        >
          {/* Main Info */}
          <Card className="lg:col-span-2 border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {selectedCommunity.image ? (
                    <Image
                      src={selectedCommunity.image}
                      alt={selectedCommunity.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <Users className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedCommunity.name}</h2>
                    {selectedCommunity.is_owner && (
                      <RiVerifiedBadgeFill className="text-blue-600 h-5 w-5" />
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-3 font-medium">
                    {selectedCommunity.is_owner ? 'Community Owner' : 'Community Member'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-800">
                    <div className="flex items-center gap-1">
                      <MdPeopleAlt className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{formatNumber(selectedCommunity.member_count || selectedCommunity.num_member || 0)} members</span>
                    </div>
                    {selectedCommunity.post_count && (
                      <div className="flex items-center gap-1">
                        <MdOutlineRssFeed className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{selectedCommunity.post_count} posts</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareCommunity(selectedCommunity)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {selectedCommunity.is_owner && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <FaEdit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleVisitCommunity(selectedCommunity)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedCommunity.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-gray-900">About</h3>
                  <p className="text-gray-800 text-sm leading-relaxed">{selectedCommunity.description}</p>
                </div>
              )}

              {selectedCommunity.tags && selectedCommunity.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCommunity.tags.slice(0, 6).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs font-medium">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Offerings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Offerings</h3>
                  {selectedCommunity.is_owner && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddOfferingModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {offeringsLoading ? (
                  <div className="text-center py-8 text-gray-700">Loading offerings...</div>
                ) : offerings.length > 0 ? (
                  <div className="space-y-3">
                    {offerings.slice(0, 3).map((offering) => (
                      <div 
                        key={offering._id} 
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          const communitySlug = `${selectedCommunity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${selectedCommunity._id}`;
                          router.push(`/community/${communitySlug}/offering/${offering._id}`);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors">
                              {offering.title}
                            </h4>
                            <p className="text-xs text-gray-700 line-clamp-2 mt-1">
                              {offering.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {offering.duration}min
                              </span>
                              {offering.type && (
                                <Badge variant="outline" className="text-xs py-0 px-1">
                                  {offering.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            {offering.is_free || Number(offering.discounted_price) === 0 ? (
                              <Badge className="bg-green-100 text-green-800 text-xs font-medium">Free</Badge>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">₹{offering.discounted_price || offering.price?.amount || 0}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {offerings.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          const communitySlug = `${selectedCommunity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${selectedCommunity._id}`;
                          router.push(`/community/${communitySlug}/offerings`);
                        }}
                      >
                        View All {offerings.length} Offerings
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-700">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No offerings yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Sidebar */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedCommunity.is_owner ? (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Community
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAddOfferingModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Offering
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleShareCommunity(selectedCommunity)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Community
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleVisitCommunity(selectedCommunity)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Community
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleShareCommunity(selectedCommunity)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}

              {/* Social Stats */}
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium text-sm text-gray-900">Social Stats</h4>
                {selectedCommunity.instagram_followers && (
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <GrInstagram className="h-4 w-4 text-pink-500" />
                    <span className="font-medium">{formatNumber(selectedCommunity.instagram_followers)} Instagram</span>
                  </div>
                )}
                {selectedCommunity.youtube_followers && (
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <BsYoutube className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{formatNumber(selectedCommunity.youtube_followers)} YouTube</span>
                  </div>
                )}
                {selectedCommunity.linkedin_followers && (
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <FaLinkedinIn className="h-4 w-4 text-blue-800" />
                    <span className="font-medium">{formatNumber(selectedCommunity.linkedin_followers)} LinkedIn</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="px-4 md:px-6 py-4">
          <Card className="border border-gray-200">
            <CardContent className="text-center py-16">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Select a Community</h3>
              <p className="text-gray-700 mb-6 font-medium">
                Choose a community from above to view its details and manage offerings
              </p>
              <Button 
                onClick={handleCreateCommunity}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Community
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Testimonials */}
      {selectedCommunity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 md:px-6 py-4"
        >
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <Testimonials communityId={selectedCommunity._id} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modals */}
      <Dialog open={showCreatorForm} onOpenChange={setShowCreatorForm}>
        <CreatorForm 
          onClose={handleCreatorFormClose}
          onSuccess={handleCreatorFormSuccess}
        />
      </Dialog>

      {/* Add Offering Modal */}
      <Dialog open={showAddOfferingModal} onOpenChange={setShowAddOfferingModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Offering</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffering} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={offeringForm.title}
                onChange={(e) => setOfferingForm({...offeringForm, title: e.target.value})}
                placeholder="Enter offering title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={offeringForm.description}
                onChange={(e) => setOfferingForm({...offeringForm, description: e.target.value})}
                placeholder="Describe your offering"
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={offeringForm.type} onValueChange={(value) => setOfferingForm({...offeringForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={offeringForm.duration}
                  onChange={(e) => setOfferingForm({...offeringForm, duration: parseInt(e.target.value) || 60})}
                  min="15"
                  max="480"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={offeringForm.is_free}
                  onChange={(e) => setOfferingForm({...offeringForm, is_free: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_free">This is a free offering</Label>
              </div>
            </div>

            {!offeringForm.is_free && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={offeringForm.price}
                  onChange={(e) => setOfferingForm({...offeringForm, price: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="Enter price"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddOfferingModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Create Offering
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>



      {isEditOpen && selectedCommunity && (
        <EditCommunityModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profile={{
            instagram_followers: selectedCommunity.instagram_followers || '',
            youtube_followers: selectedCommunity.youtube_followers || '',
            community: {
              name: selectedCommunity.name,
              description: selectedCommunity.description || '',
              tags: selectedCommunity.tags || [],
              image: selectedCommunity.image || '',
              background_image: selectedCommunity.background_image || '',
              num_member: selectedCommunity.num_member || 0,
              post_count: selectedCommunity.post_count || 0,
              is_locked: false,
              youtube_followers: selectedCommunity.youtube_followers || '',
              instagram_followers: selectedCommunity.instagram_followers || '',
              linkedin_followers: selectedCommunity.linkedin_followers || ''
            },
            user: {
              user_name: user?.name || '',
              user_email: user?.email || '',
              user_avatar: user?.image || '',
              about: '',
              user_isBankDetailsAdded: false,
              user_iscalendarConnected: false,
              user_year_of_experience: 0,
              user_session_conducted: 0,
              user_languages: []
            }
          }}
        />
      )}
    </>
  );
};

export default MyGuildDashboard;
