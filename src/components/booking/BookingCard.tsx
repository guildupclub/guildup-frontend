"use client";

import React from "react";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";

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
  onCancel?: () => void;
  onReschedule?: () => void;
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
  status = "upcoming",
  onCancel,
  onReschedule,
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
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

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
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
            <div>
              <h3 className="font-semibold text-slate-900">{name}</h3>
              <p className="text-sm text-slate-500">{role}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={
                    status === "upcoming"
                      ? "outline"
                      : status === "completed"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    status === "upcoming"
                      ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : status === "completed"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : ""
                  }
                >
                  {status === "upcoming"
                    ? "Upcoming"
                    : status === "completed"
                    ? "Completed"
                    : "Cancelled"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Booking status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Service</p>
              <p className="text-sm font-medium text-slate-900">{service}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Guest</p>
              <p className="text-sm font-medium text-slate-900">{guest}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Host</p>
              <p className="text-sm font-medium text-slate-900">{host}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Booked on</p>
              <p className="text-sm font-medium text-slate-900">{bookedOn}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-slate-50 px-6 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <p className="font-medium text-slate-900">{formattedAmount}</p>
        </div>
        {status === "upcoming" && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={onReschedule}>
              Reschedule
            </Button>
          </div>
        )}
        {status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          >
            Book Again
          </Button>
        )}
        {status === "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
