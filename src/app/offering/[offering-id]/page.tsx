// Premium offering page using Chakra UI components
"use client";
import React from "react";
import { useParams } from "next/navigation";
import { 
  Box, 
  Container, 
  VStack, 
  HStack,
  Text,
  Heading,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import OfferingPage from "@/components/offerings/offeringPage";
import { primary } from "@/app/colours";

export default function Page() {
  let { "offering-id": offeringId } = useParams();
  offeringId = String(offeringId);
  
  const bgGradient = useColorModeValue(
    `linear-gradient(180deg, ${primary}1A 0%, rgba(255,255,255,0) 100%)`,
    `linear-gradient(180deg, ${primary}2A 0%, rgba(0,0,0,0) 100%)`
  );
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Box minH="100vh" bg="white" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box position="absolute" inset={0} overflow="hidden">
        <Box
          position="absolute"
          top="-160px"
          right="-160px"
          w="320px"
          h="320px"
          borderRadius="full"
          opacity={0.1}
          bg={`radial-gradient(circle, ${primary} 0%, transparent 70%)`}
          animation="pulse 4s ease-in-out infinite"
        />
        <Box
          position="absolute"
          bottom="-160px"
          left="-160px"
          w="384px"
          h="384px"
          borderRadius="full"
          opacity={0.05}
          bg={`radial-gradient(circle, ${primary} 0%, transparent 70%)`}
          animation="pulse 6s ease-in-out infinite"
        />
      </Box>

      {/* Hero section with enhanced gradient */}
      <Box
        w="full"
        h={{ base: "200px", sm: "240px", lg: "280px" }}
        bg={bgGradient}
        position="relative"
      >
        {/* Floating elements */}
        <Box
          position="absolute"
          top="32px"
          left="32px"
          w="16px"
          h="16px"
          borderRadius="full"
          bg={primary}
          opacity={0.3}
          animation="bounce 2s infinite"
        />
        <Box
          position="absolute"
          top="64px"
          right="48px"
          w="12px"
          h="12px"
          borderRadius="full"
          bg={primary}
          opacity={0.4}
          animation="bounce 2s infinite 0.5s"
        />
        <Box
          position="absolute"
          top="96px"
          left="25%"
          w="8px"
          h="8px"
          borderRadius="full"
          bg={primary}
          opacity={0.5}
          animation="bounce 2s infinite 1s"
        />
      </Box>

      {/* Content container */}
      <Box position="relative" mt={{ base: "-80px", sm: "-100px" }} mb="64px" px={{ base: 4, sm: 6, lg: 8 }}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            {/* Main content card */}
            <Box
              bg={cardBg}
              backdropFilter="blur(10px)"
              borderRadius="3xl"
              boxShadow="2xl"
              border="1px solid"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
            >
              {/* Decorative top border */}
              <Box
                h="4px"
                w="full"
                bg={`linear-gradient(90deg, ${primary} 0%, ${primary}80 50%, ${primary} 100%)`}
              />
              
              {/* Content */}
              <Box p={{ base: 6, sm: 8, lg: 12 }}>
                <OfferingPage offeringId={offeringId} />
              </Box>
              
              {/* Decorative bottom elements */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="8px"
                bg="gradient-to-r"
                bgGradient="linear(to-r, transparent, gray.100, transparent)"
                opacity={0.5}
              />
            </Box>
            
            {/* Additional decorative elements */}
            <HStack spacing={6} justify="center" opacity={0.3}>
              <Box h="8px" w="full" bgGradient="linear(to-r, transparent, gray.200)" borderRadius="full" />
              <Box h="8px" w="full" bgGradient="linear(to-r, gray.200, gray.300, gray.200)" borderRadius="full" />
              <Box h="8px" w="full" bgGradient="linear(to-r, gray.200, transparent)" borderRadius="full" />
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
