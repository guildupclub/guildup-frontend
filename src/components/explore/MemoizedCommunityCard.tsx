"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Card, CardBody, Image, Text, Badge, HStack, Divider } from '@chakra-ui/react';
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "../../redux/communitySlice";
import { setActiveCommunity } from "../../redux/channelSlice";
import { primary } from "@/app/colours";

interface MemoizedCommunityCardProps {
  community: any;
  onClick: () => void;
}

const MemoizedCommunityCard = React.memo<MemoizedCommunityCardProps>(
  ({ community, onClick }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const communityDetails = community?.community || community;

    const [showDescription, setShowDescription] = useState<boolean>(false);

    const handleMouseEnter = useCallback(() => {
      // Show description on hover
      setShowDescription(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      // Hide description when mouse leaves
      setShowDescription(false);
    }, []);
    

    const getTagColor = (index: number) => {
      const colors = [
        "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
        "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
        "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100",
        "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
        "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
      ];
      return colors[index % colors.length];
    };

    // Process tags from the community data
    const tags = useMemo(() => {
      if (!communityDetails?.tags || !communityDetails.tags.length) return [];
      
      let allTags: string[] = [];
      communityDetails.tags.forEach((tagItem: any) => {
        if (typeof tagItem === "string") {
          if (tagItem.includes(",")) {
            const splitTags = tagItem.split(",").map((tag: string) => tag.trim()).filter(Boolean);
            allTags = [...allTags, ...splitTags];
          } else {
            allTags.push(tagItem.trim());
          }
        } else if (Array.isArray(tagItem)) {
          tagItem.forEach((tag: any) => {
            if (typeof tag === "string") {
              if (tag.includes(",")) {
                const splitTags = tag.split(",").map((t: string) => t.trim()).filter(Boolean);
                allTags = [...allTags, ...splitTags];
              } else {
                allTags.push(tag.trim());
              }
            }
          });
        }
      });
      return [...new Set(allTags)].filter(Boolean);
    }, [communityDetails?.tags]);

    // Get avatar image URL
    const avatarImgUrl = useMemo(() => {
      if (!communityDetails) return "";
      const seedValue = communityDetails._id || 
        (communityDetails.name && `${communityDetails.name}-${communityDetails.user_id || Date.now()}`);
      
      return communityDetails.image || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}`;
    }, [communityDetails]);

    // Simplified type: use first tag as a single tag line

    // Add reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);

    // Fetch reviews
    useEffect(() => {
      const fetchReviews = async () => {
        if (!communityDetails?._id) return;
        
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/feedback?community_id=${communityDetails._id}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.r === "s" && data.data?.feedbacks) {
              setReviews(data.data.feedbacks);
              
              // Calculate average rating
              const ratings = data.data.feedbacks.map((f: any) => f.rating).filter((r: number) => r > 0);
              if (ratings.length > 0) {
                const avg = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
                setAverageRating(Math.round(avg * 10) / 10); // Round to 1 decimal
              }
              setTotalReviews(ratings.length);
            }
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      };

      fetchReviews();
    }, [communityDetails?._id]);

    

    // Cursor-follow edge highlight state
    const [mousePosPct, setMousePosPct] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
    const [isHover, setIsHover] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMousePosPct({ x, y });
    }, []);

    const edgeOverlayStyle: React.CSSProperties = {
      // custom properties used in the gradient backgrounds below
      ["--mx" as any]: `${mousePosPct.x}%`,
      ["--my" as any]: `${mousePosPct.y}%`,
      pointerEvents: "none",
      borderRadius: "16px",
      opacity: isHover ? 1 : 0,
      transition: "opacity 0.2s ease",
      // Four edge gradients that peak near the cursor position
      background:
        `
        linear-gradient(to right,
          rgba(59,71,249,0) calc(var(--mx) - 18%),
          rgba(59,71,249,0.45) var(--mx),
          rgba(59,71,249,0) calc(var(--mx) + 18%)
        ) top/100% 2px no-repeat,
        linear-gradient(to bottom,
          rgba(59,71,249,0) calc(var(--my) - 18%),
          rgba(59,71,249,0.45) var(--my),
          rgba(59,71,249,0) calc(var(--my) + 18%)
        ) right/2px 100% no-repeat,
        linear-gradient(to right,
          rgba(59,71,249,0) calc(var(--mx) - 18%),
          rgba(59,71,249,0.45) var(--mx),
          rgba(59,71,249,0) calc(var(--mx) + 18%)
        ) bottom/100% 2px no-repeat,
        linear-gradient(to bottom,
          rgba(59,71,249,0) calc(var(--my) - 18%),
          rgba(59,71,249,0.45) var(--my),
          rgba(59,71,249,0) calc(var(--my) + 18%)
        ) left/2px 100% no-repeat
      `,
    };

    return (
      <Card 
        maxW="100vw" 
        w="100%"
        h="380px"
        minH="380px"
        maxH="380px"
        cursor="pointer"
        onClick={onClick}
        onMouseEnter={(e) => {
          setIsHover(true);
          handleMouseEnter();
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={(e) => {
          setMousePosPct({ x: 50, y: 50 });
          setIsHover(false);
          handleMouseLeave();
        }}
        _hover={{ 
          shadow: 'lg',
          transform: 'translateY(-2px) scale(1.01)',
          transition: 'all 0.3s ease'
        }}
        transition="all 0.3s ease"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
        borderRadius="2xl"
        bg="white"
        boxShadow="sm"
        display="flex"
        flexDirection="column"
        position="relative"
        data-analytics-type="community-card"
        data-analytics-name={communityDetails?.name || "Expert"}
        data-community-id={communityDetails?._id || ""}
        data-community-name={communityDetails?.name || ""}
      >
        {/* Edge-follow overlay (only visible on hover) */}
        <Box position="absolute" inset={0} style={edgeOverlayStyle} />
        <CardBody p={0} flex="1" display="flex" flexDirection="column" h="100%" overflow="hidden">
          {/* Image and name section - extends to divider */}
          <Box 
            flex="1"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            position="relative"
          >
            {/* Image - takes most of the space */}
            <Box 
              w="100%" 
              flex="1"
              minH="0"
              overflow="hidden"
              position="relative"
              bg="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={avatarImgUrl || "/placeholder.svg"}
                alt={communityDetails?.name || "Expert"}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Box>

            {/* Name section - below image, above divider */}
            <Box px={4} pt={3} pb={2} flexShrink={0}>
              <Text 
                fontSize="lg"
                fontWeight="bold" 
                color="gray.900" 
                fontFamily="'Poppins', sans-serif"
                textAlign="center"
                noOfLines={1}
                lineHeight="1.4"
              >
                {communityDetails?.owner_name 
                  || communityDetails?.user_name 
                  || communityDetails?.user?.name 
                  || communityDetails?.name 
                  || "Expert Name"}
              </Text>
              {(() => {
                const experience = communityDetails?.owner_experience 
                  || communityDetails?.user_year_of_experience 
                  || communityDetails?.user?.year_of_experience 
                  || 0;
                const sessions = communityDetails?.owner_sessions 
                  || communityDetails?.user_session_conducted 
                  || communityDetails?.user?.session_conducted 
                  || 0;
                const parts: string[] = [];
                if (experience > 0) parts.push(`${Math.floor(experience)} yrs`);
                if (sessions > 0) parts.push(`${Math.floor(sessions)} sessions`);
                if (parts.length === 0) return null;
                return (
                  <Text fontSize="xs" color="gray.500" fontFamily="'Poppins', sans-serif" textAlign="center" mt={0.5} noOfLines={1}>
                    {parts.join(' • ')}
                  </Text>
                );
              })()}
            </Box>

            {/* Horizontal divider */}
            <Box w="100%" h="2px" bg={primary} opacity={0.6} borderRadius="full" flexShrink={0} />
          </Box>

          {/* Details section at bottom with padding */}
          <Box px={4} pt={2} pb={4} flexShrink={0}>
            {/* Tags */}
            {tags && tags.length > 0 && (
              <Box mb={2}>
                <Text
                  fontSize="xs"
                  color="gray.600"
                  fontFamily="'Poppins', sans-serif"
                  noOfLines={2}
                  lineHeight="1.4"
                  textAlign="left"
                >
                  {tags.join(' • ')}
                </Text>
              </Box>
            )}

            {/* Languages */}
            {(communityDetails?.languages && communityDetails.languages.length > 0) && (
              <Box>
                <HStack spacing={2} align="center" flexWrap="wrap">
                  {(() => {
                    const languages = communityDetails?.languages 
                      || communityDetails?.user_languages 
                      || communityDetails?.user?.languages 
                      || [];
                    if (!languages || languages.length === 0) return null;
                    return (
                      <Text fontSize="xs" color="gray.500" fontFamily="'Poppins', sans-serif" noOfLines={1}>
                        {Array.isArray(languages) ? languages.slice(0, 2).join(', ') : languages}
                        {Array.isArray(languages) && languages.length > 2 ? '...' : ''}
                      </Text>
                    );
                  })()}
                </HStack>
              </Box>
            )}

            {/* Description shown on hover */}
            {showDescription && communityDetails?.description && (
              <Box mt={2} pt={2} borderTop="1px" borderColor="gray.200" flexShrink={0}>
                <Text fontSize="xs" color="gray.700" fontFamily="'Poppins', sans-serif" noOfLines={3}>
                  {communityDetails.description}
                </Text>
              </Box>
            )}
          </Box>
        </CardBody>
      </Card>
    );
  }
);

MemoizedCommunityCard.displayName = "MemoizedCommunityCard";

export default MemoizedCommunityCard;
