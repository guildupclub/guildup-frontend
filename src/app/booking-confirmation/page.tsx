"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  CreditCard,
  ArrowRight,
  Home,
  Download,
  Share2,
  Star,
  Zap,
} from "lucide-react";

interface Booking {
  _id: string;
  offering_id?: any;
  start_time?: string;
  end_time?: string;
  user_id?: any;
  provider_id?: any;
  status?: string;
  created_at?: string;
  payment_status?: string;
  amount_paid?: number;
}

export default function BookingConfirmation() {
  const router = useRouter();

  // Get bookingId from sessionStorage
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper functions to format booking data
  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatBookingTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatEndTime = (startTime: string, duration: number) => {
    if (!startTime || !duration) return null;
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);
    return endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get bookingId from sessionStorage on component mount
  useEffect(() => {
    const storedBookingId = sessionStorage.getItem('bookingId');
    if (storedBookingId) {
      setBookingId(storedBookingId);
      // Clear it from sessionStorage after retrieving
      sessionStorage.removeItem('bookingId');
    } else {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bookingId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/${bookingId}`
        );

        if (response.data?.r === "s" && response.data?.data) {
          setBooking(response.data.data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <h3 className="text-base font-semibold text-gray-700">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md shadow-md border-0">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Booking Not Found
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              We couldn&apos;t find your booking details.
            </p>
            <Button
              onClick={() => router.push("/booking")}
              size="sm"
              className="w-full bg-gray-700 text-white hover:bg-gray-800"
            >
              Go to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookingDate = booking?.created_at
    ? new Date(booking.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <Card className="w-full max-w-lg shadow-md border-0">
        <CardHeader className="p-4 border-b">
          <div className="flex  items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="lg:text-lg font-semibold text-gray-900">
                Booking Confirmed
              </CardTitle>
            </div>
            <p className="text-xs text-gray-500">ID: {bookingId}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Success Message */}
          <div className="text-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              All Set!
            </h2>
            <p className="text-sm text-gray-600">
              Your {booking?.offering_id?.type || "consultation"} is confirmed.{" "}
              {booking?.offering_id?.is_free ? "Enjoy!" : "Payment processed."}
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            {/* Service */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Service
                </span>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking?.offering_id?.title || "Service Booking"}
                  {booking?.offering_id?.is_free && (
                    <span className="ml-1 text-xs text-green-600">FREE</span>
                  )}
                </p>
              </div>
            </div>

            {/* Date */}

            <div className="flex flex-wrap gap-4">
              {/* Date */}
              <div className="flex items-center gap-2 min-w-[150px]">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Date
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.start_time ? formatBookingDate(booking.start_time) : "Date not available"}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 min-w-[150px]">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Time
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.start_time ? formatBookingTime(booking.start_time) : "Time not available"}
                    {booking?.start_time && booking?.offering_id?.duration && 
                      ` - ${formatEndTime(booking.start_time, booking.offering_id.duration)}`}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 min-w-[150px]">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Duration
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.offering_id?.duration || "N/A"} minutes
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 min-w-[150px]">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Price
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.offering_id?.is_free ? "FREE" : `${booking?.offering_id?.price?.currency || "INR"} ${booking?.offering_id?.price?.amount || 0}`}
                  </p>
                </div>
              </div>
            </div>
            {/* Provider */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Provider
                </span>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking?.provider_id?.name || booking?.offering_id?.community_id?.name || "Service Provider"}
                </p>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            {/* <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-600" />
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Status
                </span>
                <p className="text-sm font-medium text-green-600">
                  CONFIRMED
                  <span className="text-xs text-gray-500 ml-1">
                    on {bookingDate}
                  </span>
                </p>
              </div>
            </div> */}
          </div>

          {/* Next Steps */}
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              What&apos;s Next?
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>WhatsApp confirmation sent</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Email with details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Join 5 minutes early</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => router.push("/booking")}
              size="sm"
              className="w-full  text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              View Bookings
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              size="sm"
              className="w-full text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Home className="w-3 h-3 mr-1" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
