"use client";

import React from "react";
import { CalendarDays, CalendarRange, Clock, Handshake, IndianRupee, MapPin, User, X } from "lucide-react";

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
  onCancel?: () => void;
  onReschedule?: () => void;
  startTime: string;
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
  onCancel,
  onReschedule,
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

  // Format date to Month, DD, YYYY
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return "Date not available";
    }
    
    try {
      // Handle format: 17/03/2025, 12:00:00 (DD/MM/YYYY, HH:MM:SS)
      if (dateString.includes('/')) {
        // Split the date and time parts
        const [datePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/');
        
        // Create date object with MM/DD/YYYY format (JavaScript expects this)
        const date = new Date(`${month}/${day}/${year}`);
        
        if (isNaN(date.getTime())) {
          console.log("Invalid date after parsing:", dateString);
          return dateString;
        }
        
        // Format with month name, day, year
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const monthName = monthNames[date.getMonth()];
        const dayNum = date.getDate();
        const yearNum = date.getFullYear();
        
        return `${monthName} ${dayNum}, ${yearNum}`;
      } else {
        // Fallback for other date formats
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          console.log("Invalid date, returning original:", dateString);
          return dateString;
        }
        
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        
        return `${month} ${day}, ${year}`;
      }
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  // Format time to HH:MM AM/PM
  const formatTime = (timeString: string) => {
    if (!timeString) return "Time not available";
    
    try {
      // Handle different time formats
      let hours: number, minutes: number;
      
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
      } else if (timeString.includes('T')) {
        // Handle ISO date string with time
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        hours = date.getHours();
        minutes = date.getMinutes();
      } else {
        // If it doesn't match expected formats, return original
        return timeString;
      }
      
      if (isNaN(hours) || isNaN(minutes)) return timeString;
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };
  

  return (
    <Card className="overflow-hidden w-fit h-[16rem] m-0 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage
                src={profileImage || "/placeholder.svg"}
                alt={name}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div >
              <h3 className="font-semibold text-slate-900">{name}</h3>
              <div className="flex items-center gap-2">
              <Badge variant="outline" className="p-1 rounded-sm px-2 bg-blue-100  w-fit text-sm text-blue-700 flex items-center gap-1">
                <Handshake className="h-4 w-4 mt-1" />{role}
              </Badge>
              <Badge className="p-1 rounded-sm px-2 bg-blue-100  w-fit text-sm text-blue-700 flex items-center gap-1">
              {formattedAmount}
              </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mb-2 border-b border-zinc-200/80 pb-2">
          <p className="text-sm font-semibold text-slate-900 line-clamp-1 truncate">{offeringName}</p>
          <p className="text-sm text-slate-500 line-clamp-2 truncate">{offeringDescription}</p>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex gap-4">
          <div className="flex items-start flex-col">
            <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium text-slate-500">
            Booked Date
            </p>
            </div>
            <p className="text-md font-medium text-slate-900 ml-6">{formatDate(bookedOn)}</p>
          </div>
          <div className="flex items-start flex-col ">
            <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <p className="text-sm font-medium text-slate-500">
            Booked Time
            </p>
            </div>
            <p className="text-md font-medium text-slate-900 ml-6">{formatTime(startTime)}</p>
          </div>
        </div>
      </CardContent>
    
      <CardFooter className="flex justify-between gap-4">
        <Button variant="outline" className="w-fit text-blue-500 border-2 border-blue-500 rounded-lg" onClick={onReschedule}>
          <CalendarRange/> Reschedule Booking
        </Button>
        <Button variant="outline" className="w-fit bg-blue-500 text-white rounded-lg" onClick={onCancel}>
        <X/> Cancel Booking 
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
