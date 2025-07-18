"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Users, Calendar, Phone, Globe } from 'lucide-react';
import Image from 'next/image';

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

interface ExpertCardProps {
  expert: Expert;
  index: number;
  currentIndex: number;
}

export default function ExpertCard({ expert, index, currentIndex }: ExpertCardProps) {
  return (
    <motion.div
      key={`${expert.name}-${currentIndex}`}
      initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: index === 0 ? -20 : 20 }}
      transition={{ 
        duration: 0.5, 
        ease: "easeInOut",
        delay: index * 0.1 
      }}
      className="flex flex-col"
    >
      <div className="bg-primary/5 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
        {/* Top Section - Expert Profile */}
        <div className="flex gap-4 mb-4">
          {/* Expert Image */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-32 rounded-lg overflow-hidden">
              <Image
                src={expert.avatar}
                alt={expert.name}
                width={112}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Expert Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{expert.specialty}</p>
              
              {/* Consultation Details */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary font-semibold">₹{expert.price}</span>
                <span className="text-red-500 line-through text-sm">{expert.originalPrice}</span>
                <span className="text-sm text-gray-600">{expert.consultation}</span>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{expert.languages.join(", ")}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                {expert.rating} ({expert.sessions} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Skills/Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {expert.skills.map((skill, skillIndex) => (
            <Badge key={skillIndex} variant="secondary" className="text-sm bg-white border-gray-300 rounded-full px-3 py-1">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Bottom Section - Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-600">Years of Experience</div>
              <div className="text-sm font-semibold text-gray-900">{expert.experience}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-600">Sessions Conducted</div>
              <div className="text-sm font-semibold text-gray-900">{expert.sessions}+ Sessions</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-600">Next available slot</div>
              <div className="text-sm font-semibold text-gray-900">{expert.nextSlot}</div>
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-auto"
          onClick={() => window.open(expert.url, '_blank', 'noopener,noreferrer')}
        >
          <Phone className="w-4 h-4 mr-2" />
          Quick Explore Call
        </Button>
      </div>
    </motion.div>
  );
} 