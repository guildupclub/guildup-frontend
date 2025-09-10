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
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { IoVideocam } from "react-icons/io5";
import { ImUsers } from "react-icons/im";

import { toast } from "sonner";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { FaLinkedinIn, FaBriefcase, FaBullseye } from "react-icons/fa";
import numbro from "numbro";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "../../redux/communitySlice";
import { setActiveCommunity } from "../../redux/channelSlice";

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

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.900', 'white');
    const subTextColor = useColorModeValue('gray.600', 'gray.300');
    const accentColor = useColorModeValue('blue.50', 'blue.900');
    const trustBadgeBg = useColorModeValue('green.50', 'green.900');
    const trustBadgeColor = useColorModeValue('green.700', 'green.300');

    return (
      <Card 
        maxW="full" 
        h="280px"
        cursor="pointer"
        onClick={handleCardClick}
        _hover={{ 
          shadow: 'xl',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }}
        transition="all 0.3s ease"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
        borderRadius="2xl"
        bg={cardBg}
        boxShadow="md"
        display="flex"
        flexDirection="column"
        data-analytics-type="community-card"
        data-analytics-name={communityDetails?.name || "Expert"}
        data-community-id={communityDetails?._id || ""}
        data-community-name={communityDetails?.name || ""}
      >
        <CardBody p={0} flex="1" display="flex" flexDirection="column">
          {/* Main Content - Image Left, Details Right */}
          <Flex direction={{ base: "column", md: "row" }} flex="1">
            {/* Left Side - Profile Image */}
            <Box 
              w={{ base: "100%", md: "120px" }} 
              h={{ base: "120px", md: "auto" }}
              position="relative"
              overflow="hidden"
              bg="gray.50"
              flexShrink={0}
            >
              <Image
                src={avatarImgUrl || "/placeholder.svg"}
                alt={communityDetails?.name || "Expert"}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="center 20%"
              />
            </Box>

            {/* Right Side - Expert Details */}
            <Box flex="1" p={4} display="flex" flexDirection="column" justifyContent="space-between">
              <VStack spacing={4} align="stretch" flex="1">
                {/* Name and Title */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={1}>
                    {communityDetails?.name || "Expert Name"}
                  </Text>
                  <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                    Clinical Psychologist
                  </Text>
                </Box>

                {/* Rating */}
                <Box>
                  <HStack spacing={1} align="center">
                    <StarIcon color="yellow.400" boxSize={3} />
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>4.8</Text>
                    <Text fontSize="xs" color={subTextColor}>(30)</Text>
                  </HStack>
                </Box>

                {/* Experience */}
                <Box>
                  <HStack spacing={1} align="center">
                    <Icon viewBox="0 0 24 24" boxSize={3} color="blue.500">
                      <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </Icon>
                    <Text fontSize="xs" color={subTextColor}>11+ years</Text>
                  </HStack>
                </Box>

                {/* Pricing - Simplified */}
                <Box>
                  <HStack spacing={2} align="baseline">
                    <Text fontSize="sm" color="red.500" textDecoration="line-through">
                      ₹800
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                      Free for 30 min
                    </Text>
                  </HStack>
                </Box>

                {/* Expertise Tags */}
                <Box 
                  w="100%"
                  maxW="100%"
                  overflowX="auto" 
                  overflowY="hidden"
                  css={{
                    '&::-webkit-scrollbar': {
                      height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#e2e8f0',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#cbd5e0',
                    },
                  }}
                >
                  <Flex 
                    direction="row" 
                    align="center" 
                    minW="max-content"
                    pb={1}
                    gap={2}
                  >
                    {tags && tags.length > 0 ? (
                      tags.slice(0, 5).map((tag, index) => (
                        <Badge
                          key={index}
                          bg="gray.100"
                          color="gray.700"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          whiteSpace="nowrap"
                          flexShrink={0}
                          minW="fit-content"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <>
                        <Badge bg="gray.100" color="gray.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0} minW="fit-content">
                          PSYCHOLOGIST
                        </Badge>
                        <Badge bg="gray.100" color="gray.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0} minW="fit-content">
                          CLINICAL
                        </Badge>
                        <Badge bg="gray.100" color="gray.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0} minW="fit-content">
                          ADHD
                        </Badge>
                        <Badge bg="gray.100" color="gray.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0} minW="fit-content">
                          ANXIETY
                        </Badge>
                        <Badge bg="gray.100" color="gray.700" px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0} minW="fit-content">
                          TRAUMA
                        </Badge>
                      </>
                    )}
                  </Flex>
                </Box>

              </VStack>
            </Box>
          </Flex>

          {/* Bottom Section - Booking Options */}
          <Box 
            p={0} 
            borderTop="1px" 
            borderColor="gray.200"
            borderRadius="0 0 16px 16px"
            overflow="hidden"
          >
            <Button
              w="full"
              bg="gray.100"
              _hover={{
                bg: "gray.200",
                transform: "translateY(-1px)",
                shadow: "md"
              }}
              color="gray.700"
              fontWeight="semibold"
              py={4}
              borderRadius="0"
              transition="all 0.3s ease"
              fontSize="sm"
              leftIcon={<Icon viewBox="0 0 24 24" boxSize={4}><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></Icon>}
              onClick={handleClaimFreeSession}
              data-analytics-type="community-cta"
              data-analytics-name="Quick Explore Call"
              data-community-id={communityDetails?._id || ""}
              data-community-name={communityDetails?.name || ""}
            >
              Quick Explore Call
            </Button>
          </Box>
        </CardBody>
      </Card>
    );
  }
);

MemoizedCommunityCard.displayName = "MemoizedCommunityCard";

export default MemoizedCommunityCard;
