"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ExpertCard from './ExpertCard';

// Using the same featured experts data from the hero section
const featuredExperts = [
  {
    name: "Amit Garg",
    specialty: "Weight training, Nutrition, Fat-Loss, Strength",
    rating: 4.9,
    sessions: 250,
    avatar: "/experts/amit.jpg",
    verified: true,
    available: true,
    url: "https://www.guildup.club/community/GetfitwithAmit-682dabd74264957c9ad90a64/profile",
    languages: ["Hindi", "English", "Gujarati", "Urdu", "French"],
    experience: "5+ years",
    nextSlot: "Today, 05:30 PM",
    price: "Free",
    originalPrice: "800",
    consultation: "for 30 min consultation",
    skills: ["Nutrition", "Dieting", "Fitness", "Strength Training"]
  },
  {
    name: "Nikhar Matta",
    specialty: "Life Coach, Emotional Healing, Relationship Coaching, Therapy",
    rating: 4.8,
    sessions: 100,
    avatar: "/experts/nikhar.jpg",
    verified: true,
    available: true,
    url: "https://www.guildup.club/community/Bettermind-with-Nikhar-6821cae798627fbe232cc209/profile",
    languages: ["Hindi", "English", "Gujarati", "Urdu", "French"],
    experience: "5+ years",
    nextSlot: "Today, 05:30 PM",
    price: "Free",
    originalPrice: "800",
    consultation: "for 30 min consultation",
    skills: ["Nutrition", "Dieting", "Mental Health", "Coaching"]
  },
  {
    name: "Ashlesha Bhadoria",
    specialty: "Yoga, Pranayam, PCOD, Pregnancy yoga, Fitness",
    rating: 5.0,
    sessions: 580,
    avatar: "/experts/ashlesha.jpg",
    verified: true,
    available: true,
    url: "https://www.guildup.club/community/SimpliYoga-with-Ashlesha-683f18575411ca44bde8f746/profile",
    languages: ["Hindi", "English", "Gujarati", "Urdu", "French"],
    experience: "5+ years",
    nextSlot: "Today, 05:30 PM",
    price: "Free",
    originalPrice: "700",
    consultation: "for 30 min consultation",
    skills: ["Nutrition", "Dieting", "Yoga", "Fitness"]
  }
];

export default function FeaturedExperts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? featuredExperts.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === featuredExperts.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Get the current expert and next expert for display
  const currentExpert = featuredExperts[currentIndex];
  const nextExpert = featuredExperts[(currentIndex + 1) % featuredExperts.length];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Experts</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`p-2 transition-all duration-200 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            onClick={handlePrevious}
            disabled={isTransitioning}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`p-2 transition-all duration-200 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            onClick={handleNext}
            disabled={isTransitioning}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[currentExpert, nextExpert].map((expert, index) => (
          <ExpertCard
            key={`${expert.name}-${currentIndex}`}
            expert={expert}
            index={index}
            currentIndex={currentIndex}
          />
        ))}
      </div>
    </div>
  );
} 