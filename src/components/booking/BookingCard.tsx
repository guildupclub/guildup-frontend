"use client";

import React from "react";
import { CalendarDays, Clock, Handshake, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookingCardProps {
  profileImage: string;
  name: string;
  role: string;
  service: string;
  host: string;
  guest: string;
  bookedOn: string;
  amount: number;
  status?: "upcoming" | "completed" | "cancelled";
  offeringName: string;
  offeringDescription: string;
  startTime: string;
  meetingUrl?: string;
  isLiveBooking?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  profileImage,
  name,
  role,
  service,
  host,
  guest,
  bookedOn,
  amount,
  offeringName,
  offeringDescription,
  startTime,
  status = "upcoming",
  meetingUrl,
  isLiveBooking = false,
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return ""; // or return "NA" or some default initials
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format amount with commas
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

  // Format date to Month DD, YYYY (e.g., "January 8, 2025")
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return "Date not available";
    }
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log("Invalid date:", dateString);
        return "Date not available";
      }
      
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const monthName = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${monthName} ${day}, ${year}`;
    } catch (error) {
      console.log("Error parsing date:", error);
      return "Date not available";
    }
  };

  // Format time to HH:MM AM/PM
  const formatTime = (timeString: string) => {
    if (!timeString) return "Time not available";
    
    try {
      const date = new Date(timeString);
      
      if (isNaN(date.getTime())) {
        console.log("Invalid time:", timeString);
        return "Time not available";
      }
      
      return date.toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.log("Error parsing time:", error);
      return "Time not available";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-white to-primary/5 border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 border border-gray-100">
            <AvatarImage
              src={profileImage}
              alt={name}
            />
            <AvatarFallback className="bg-primary/5 text-primary text-sm font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{name}</h3>
            <div className="flex items-center gap-1.5">
              <Badge className="px-2 py-0.5 bg-primary/5 text-primary text-xs font-normal rounded-md border-0">
                <Handshake className="h-3 w-3 mr-1" />
                {role}
              </Badge>
              <Badge className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-normal rounded-md border-0">
                {formattedAmount}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 px-6">
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-gray-900 text-sm">{offeringName}</h4>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{offeringDescription}</p>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">Booked Date</p>
              <p className="text-sm text-gray-700 font-medium truncate">{formatDate(bookedOn)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">Booked Time</p>
              <p className="text-sm text-gray-700 font-medium truncate">{formatTime(startTime)}</p>
            </div>
          </div>
        </div>
      </CardContent>

      {isLiveBooking && meetingUrl && (
        <CardFooter className="pt-0 pb-6 px-6">
          <Button 
            size="sm"
            className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-200 shadow-sm"
            onClick={() => window.open(meetingUrl, '_blank')}
          >
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Join Meeting
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BookingCard;
