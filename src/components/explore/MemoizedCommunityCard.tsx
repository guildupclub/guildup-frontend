"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Card,
  CardBody,
  Image,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Flex,
  Icon,
  Divider,
  useColorModeValue,
  Tooltip,
  Avatar,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { IoVideocam } from "react-icons/io5";
import { ImUsers } from "react-icons/im";
import { FaCheckCircle, FaCrown, FaAward, FaCalendarAlt, FaUsers, FaClock } from "react-icons/fa";

import { toast } from "sonner";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { FaLinkedinIn, FaBriefcase, FaBullseye } from "react-icons/fa";
import numbro from "numbro";
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

    const handleCardClick = useCallback(() => {
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Update Redux state
      dispatch(
        setCommunityData({
          communityId: communityDetails._id,
          userId: communityDetails.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: communityDetails._id,
          name: communityDetails.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );

      // Navigate to community profile page
      router.push(`/community/${communityParams}/profile`);
    }, [communityDetails, dispatch, router]);

    const handleViewProfile = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Update Redux state
      dispatch(
        setCommunityData({
          communityId: communityDetails._id,
          userId: communityDetails.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: communityDetails._id,
          name: communityDetails.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );

      // Navigate to community profile page
      router.push(`/community/${communityParams}/profile`);
    }, [communityDetails, dispatch, router]);

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Create the full URL
      const communityUrl = `${window.location.origin}/community/${communityParams}/profile`;

      // Copy to clipboard
      navigator.clipboard.writeText(communityUrl).then(() => {
        toast.success("Link copied to clipboard!", {
          description: "Share this link with others to invite them",
        });
      }).catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again or copy the link manually",
        });
      });
    }, [communityDetails]);

    const handleClaimFreeSession = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails?.min_offering_id) {
        console.error("No minimum offering ID available:", communityDetails);
        // toast.error("Session booking unavailable", {
        //   description: "Please try again later or contact support",
        // });
        return;
      }

      // Navigate to the offering page
      router.push(`/offering/${communityDetails.min_offering_id}`);
    }, [communityDetails, router]);

    const formatNumber = (num: number) => {
      return numbro(num).format({ average: true, mantissa: 1 });
    };

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

    // Get community type/specialty
    const getCommunityType = useMemo(() => {
      if (!communityDetails) return "Expert";
      
      // First try to get from category field
      if (communityDetails.category) {
        return communityDetails.category;
      }
      
      // If no category, try to extract from tags
      if (tags && tags.length > 0) {
        // Look for common professional types in tags
        const professionalTypes = [
          'psychologist', 'therapist', 'counselor', 'coach', 'nutritionist', 
          'trainer', 'doctor', 'specialist', 'consultant', 'advisor'
        ];
        
        for (const tag of tags) {
          const lowerTag = tag.toLowerCase();
          for (const type of professionalTypes) {
            if (lowerTag.includes(type)) {
              return tag;
            }
          }
        }
        
        // If no professional type found, return the first tag
        return tags[0];
      }
      
      // If no tags, try to extract from description
      if (communityDetails.description) {
        const desc = communityDetails.description.toLowerCase();
        if (desc.includes('psychologist')) return 'Psychologist';
        if (desc.includes('therapist')) return 'Therapist';
        if (desc.includes('counselor')) return 'Counselor';
        if (desc.includes('coach')) return 'Coach';
        if (desc.includes('nutritionist')) return 'Nutritionist';
        if (desc.includes('trainer')) return 'Trainer';
        if (desc.includes('doctor')) return 'Doctor';
        if (desc.includes('specialist')) return 'Specialist';
        if (desc.includes('consultant')) return 'Consultant';
        if (desc.includes('advisor')) return 'Advisor';
      }
      
      // Default fallback
      return "Wellness Expert";
    }, [communityDetails, tags]);

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

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.900', 'white');
    const subTextColor = useColorModeValue('gray.600', 'gray.300');
    const accentColor = useColorModeValue(`${primary}15`, `${primary}20`);
    const trustBadgeBg = useColorModeValue(`${primary}10`, `${primary}20`);
    const trustBadgeColor = useColorModeValue(primary, `${primary}80`);
    const primaryColor = primary;
    const premiumGradient = useColorModeValue(
      `linear-gradient(135deg, ${primary}08 0%, ${primary}15 50%, ${primary}08 100%)`,
      `linear-gradient(135deg, ${primary}15 0%, ${primary}25 50%, ${primary}15 100%)`
    );

    return (
      <Card 
        maxW="100vw" 
        w="100%"
        h="auto"
        minH="auto"
        cursor="pointer"
        onClick={handleCardClick}
        _hover={{ 
          shadow: 'xl',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }}
        transition="all 0.3s ease"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
        borderRadius="2xl"
        bg="white"
        boxShadow="lg"
        display="flex"
        flexDirection="column"
        position="relative"
        data-analytics-type="community-card"
        data-analytics-name={communityDetails?.name || "Expert"}
        data-community-id={communityDetails?._id || ""}
        data-community-name={communityDetails?.name || ""}
      >
        <CardBody p={6} flex="1" display="flex" flexDirection="column">
          {/* Top Section - Profile and Key Info */}
          <Flex direction={{ base: "column", md: "row" }} gap={6} mb={6}>
            {/* Profile Image */}
            <Box 
              w={{ base: "120px", md: "140px" }} 
              h={{ base: "120px", md: "140px" }}
              flexShrink={0}
              position="relative"
            >
              <Image
                src={avatarImgUrl || "/placeholder.svg"}
                alt={communityDetails?.name || "Expert"}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="center"
                borderRadius="xl"
                boxShadow="md"
              />
            </Box>

            {/* Name, Title, and Key Info */}
            <Box flex="1">
              <VStack spacing={4} align="stretch">
                {/* Name and Title */}
                <Box>
                  <Text 
                    fontSize={{ base: "xl", md: "2xl" }} 
                    fontWeight="bold" 
                    color="gray.900" 
                    mb={1}
                    fontFamily="Garamond, serif"
                  >
                    {communityDetails?.name || "Expert Name"}
                  </Text>
                  <Text 
                    fontSize="md" 
                    color="gray.600" 
                    fontWeight="medium"
                    fontFamily="Garamond, serif"
                  >
                    {getCommunityType}
                  </Text>
                </Box>

                {/* Pricing */}
                <Box>
                  <HStack spacing={2} align="baseline">
                    <Text fontSize="lg" fontWeight="bold" color={primaryColor} fontFamily="Garamond, serif">
                      ₹ Free
                    </Text>
                    <Text fontSize="sm" color="red.500" textDecoration="line-through" fontFamily="Garamond, serif">
                      800
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontFamily="Garamond, serif">
                      for 30 min consultation
                    </Text>
                  </HStack>
                </Box>

                {/* Languages */}
                <HStack spacing={2} align="center">
                  <Icon viewBox="0 0 24 24" boxSize={4} color={primaryColor}>
                    <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                  </Icon>
                  <Text fontSize="sm" color="gray.600" fontFamily="Garamond, serif">
                    {communityDetails?.user_languages?.length > 0 
                      ? communityDetails.user_languages.join(", ") 
                      : communityDetails?.languages?.length > 0 
                      ? communityDetails.languages.join(", ") 
                      : "Hindi, English, Gujarati, Urdu, French"}
                  </Text>
                </HStack>

                {/* Rating */}
                <HStack spacing={2} align="center">
                  <StarIcon color="yellow.500" boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium" color="yellow.600" fontFamily="Garamond, serif">
                    {averageRating > 0 
                      ? `${averageRating} (${totalReviews} reviews)` 
                      : "4.8 (30 reviews)"}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Flex>

          {/* Specializations */}
          <Box mb={6}>
            <Flex 
              direction="row" 
              align="center" 
              gap={2}
              flexWrap="wrap"
            >
              {tags && tags.length > 0 ? (
                tags.slice(0, 7).map((tag, index) => (
                  <Badge
                    key={index}
                    bg="gray.100"
                    color="gray.700"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                    whiteSpace="nowrap"
                    fontFamily="Garamond, serif"
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge bg="gray.100" color="gray.700" px={3} py={1} borderRadius="md" fontSize="sm" fontWeight="medium" whiteSpace="nowrap" fontFamily="Garamond, serif">
                    Nutrition
                  </Badge>
                  <Badge bg="gray.100" color="gray.700" px={3} py={1} borderRadius="md" fontSize="sm" fontWeight="medium" whiteSpace="nowrap" fontFamily="Garamond, serif">
                    Dieting
                  </Badge>
                  <Badge bg="gray.100" color="gray.700" px={3} py={1} borderRadius="md" fontSize="sm" fontWeight="medium" whiteSpace="nowrap" fontFamily="Garamond, serif">
                    Weight Loss
                  </Badge>
                  <Badge bg="gray.100" color="gray.700" px={3} py={1} borderRadius="md" fontSize="sm" fontWeight="medium" whiteSpace="nowrap" fontFamily="Garamond, serif">
                    Wellness
                  </Badge>
                </>
              )}
            </Flex>
          </Box>

          {/* Metrics Section */}
          <HStack spacing={6} mb={6} justify="space-between">
            <HStack spacing={2} align="center">
              <Icon as={FaAward} boxSize={4} color={primaryColor} />
              <VStack spacing={0} align="start">
                <Text fontSize="sm" color="gray.500" fontFamily="Garamond, serif">Years of Experience</Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.900" fontFamily="Garamond, serif">5+ years</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2} align="center">
              <Icon as={FaUsers} boxSize={4} color={primaryColor} />
              <VStack spacing={0} align="start">
                <Text fontSize="sm" color="gray.500" fontFamily="Garamond, serif">Sessions Conducted</Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.900" fontFamily="Garamond, serif">100+ Sessions</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2} align="center">
              <Icon as={FaCalendarAlt} boxSize={4} color={primaryColor} />
              <VStack spacing={0} align="start">
                <Text fontSize="sm" color="gray.500" fontFamily="Garamond, serif">Next available slot</Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.900" fontFamily="Garamond, serif">Today, 05:30 PM</Text>
              </VStack>
            </HStack>
          </HStack>

          {/* CTA Button */}
          <Button
            w="full"
            bg={primaryColor}
            _hover={{
              bg: `${primaryColor}CC`,
              transform: "translateY(-1px)",
              shadow: "lg"
            }}
            color="white"
            fontWeight="bold"
            py={4}
            borderRadius="xl"
            transition="all 0.3s ease"
            fontSize="lg"
            fontFamily="Garamond, serif"
            leftIcon={<Icon viewBox="0 0 24 24" boxSize={5}><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></Icon>}
            onClick={handleClaimFreeSession}
            data-analytics-type="community-cta"
            data-analytics-name="Quick Explore Call"
            data-community-id={communityDetails?._id || ""}
            data-community-name={communityDetails?.name || ""}
            boxShadow="md"
          >
            Quick Explore Call
          </Button>
        </CardBody>
      </Card>
    );
  }
);

MemoizedCommunityCard.displayName = "MemoizedCommunityCard";

export default MemoizedCommunityCard;
 