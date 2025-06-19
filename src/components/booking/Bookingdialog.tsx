"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
declare global {
  interface Window {
    Razorpay: any;
  }
}
import { CalendarIcon, Clock, ChevronLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  loadRazorpayScript,
  type RazorpayOptions,
  type RazorpayResponse,
} from "@/components/utils/razorpay";
import { motion, AnimatePresence } from "framer-motion";
import { FaRupeeSign } from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useTracking } from "@/hooks/useTracking";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { BiSolidOffer } from "react-icons/bi";
import { BsCalendarCheck } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { setActiveCommunity } from "@/redux/channelSlice";

interface BookingDialogProps {
  offering: {
    _id: string;
    title: string;
    description: string;
    type: string;
    price: {
      amount: number;
      currency: string;
    };
    discounted_price: number;
    when: Date;
    duration: number;
    is_free: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingDialog({
  offering,
  isOpen,
  onClose,
}: BookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phone, setPhone] = useState("");
  const [bookingStep, setBookingStep] = useState<
    "date" | "time" | "confirmation"
  >("date");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // New states for guest user registration
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.user.user?._id);
  const user = useSelector((state: RootState) => state.user.user);
  const isLoggedIn = !!userId;

  // Use guest info if not logged in, otherwise use user info
  const name = isLoggedIn ? user?.name || "" : guestName;
  const email = isLoggedIn ? user?.email || "" : guestEmail;

  const tracking = useTracking();
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [activeCommunityData, setActiveCommunityData] = useState<any>(null);
  const params = useParams();
  const communityParam = params?.["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityName =
    lastHyphenIndex !== -1
      ? communityParam.substring(0, lastHyphenIndex)
      : null;
  const communityIdFromParam =
    lastHyphenIndex !== -1 && communityParam.substring(lastHyphenIndex + 1)
      ? communityParam.substring(lastHyphenIndex + 1)
      : "683f18575411ca44bde8f746";
  const cleanedCommunityName =
    communityName ||
    "".replace(/\s+/g, "-").replace(/\|/g, "-").replace(/-+/g, "-");
  const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
  const communityParams = `${encodedCommunityName}-${communityIdFromParam}`;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["communityProfile", communityIdFromParam],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: communityIdFromParam,
        }
      );
      setActiveCommunityData(response.data.data);
      setActiveCommunity(response.data);
      if (response.data.r) {
        if (response?.data?.data?.community?.image) {
          setAvatarImgUrl(response.data.data.community.image);
        } else {
          setAvatarImgUrl(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.data.user.user_name}`
          );
        }

        return response.data.data;
      }
      throw new Error("Failed to fetch community profile");
    },
    enabled: !!communityIdFromParam,
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!offering) return;

    if (offering.type === "webinar") {
      setBookingStep("confirmation");
      const webinarDate = new Date(offering.when);
      setSelectedDate(webinarDate);
      setSelectedSlot({
        start: webinarDate.toISOString(),
        end: new Date(
          webinarDate.getTime() + offering.duration * 60000
        ).toISOString(),
      });
    }
  }, [offering]);

  // Set current user ID based on login status
  useEffect(() => {
    if (isLoggedIn) {
      setCurrentUserId(userId);
    }
  }, [isLoggedIn, userId]);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/available-slots`,
        {
          params: {
            offering_id: offering._id,
            date: formattedDate,
          },
        }
      );
      setAvailableSlots(response.data);
      console.log("Available slots:", response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowConfirmation(false);
    if (date) {
      // Track date selection
      tracking.trackClick("booking_date_selected", {
        offering_id: offering._id,
        offering_title: offering.title,
        offering_type: offering.type,
        selected_date: date.toISOString(),
        user_id: currentUserId,
      });

      fetchAvailableSlots(date);
      setBookingStep("time");
    }
  };

  const handleBackToCalendar = () => {
    setBookingStep("date");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    // Track time slot selection
    tracking.trackClick("booking_time_slot_selected", {
      offering_id: offering._id,
      offering_title: offering.title,
      offering_type: offering.type,
      selected_date: selectedDate?.toISOString(),
      selected_slot_start: slot.start,
      selected_slot_end: slot.end,
      user_id: currentUserId,
    });

    setSelectedSlot(slot);
    setShowConfirmation(true);
    setBookingStep("confirmation");
  };

  const filteredSlots = availableSlots.filter((slot) => {
    const startHour = new Date(slot.start).getHours();
    return startHour >= 11 && startHour < 20; // 11 AM to 8 PM
  });

  // Function to register guest user
  const registerGuestUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/register`,
        {
          name: guestName,
          email: guestEmail,
        }
      );

      if (response.data.r === "s") {
        const registeredUserId = response.data.data.user._id;
        setCurrentUserId(registeredUserId);
        toast.success("Registration successful!");
        return registeredUserId;
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register user");
      throw error;
    }
  };

  const handleBookSlot = async () => {
    // Track booking confirmation attempt
    tracking.trackClick("confirm_booking_button", {
      offering_id: offering._id,
      offering_title: offering.title,
      offering_type: offering.type,
      offering_price: offering.price.amount,
      offering_currency: offering.price.currency,
      is_free: offering.is_free,
      selected_date: selectedDate?.toISOString(),
      selected_slot_start: selectedSlot?.start,
      selected_slot_end: selectedSlot?.end,
      user_id: currentUserId,
      phone_provided: !!phone,
      is_guest_user: !isLoggedIn,
    });

    setIsProcessing(true);
    if (!selectedDate || !selectedSlot) {
      setIsProcessing(false);
      return;
    }

    try {
      let bookingUserId = currentUserId;

      // If user is not logged in, register them first
      if (!isLoggedIn) {
        if (!guestName.trim() || !guestEmail.trim()) {
          toast.error("Name and email are required for booking");
          setIsProcessing(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
          toast.error("Please enter a valid email address");
          setIsProcessing(false);
          return;
        }

        bookingUserId = await registerGuestUser();
      }

      // Validate phone number
      const phoneWithoutFormatting = phone.replace(/\D/g, "");
      if (!phoneWithoutFormatting) {
        toast.error("Phone number is required");
        setIsProcessing(false);
        return;
      }

      // Submit user information to wati API
      const watiResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/profile/wati/addContact`,
        {
          userId: bookingUserId,
          phone: phoneWithoutFormatting,
        }
      );

      if (!watiResponse.data.data?.watiSync?.success) {
        toast.error("Failed to register phone number");
        setIsProcessing(false);
        return;
      }

      // Continue with existing booking logic
      const dateObject = new Date(selectedSlot.start);
      dateObject.setMinutes(
        dateObject.getMinutes() - dateObject.getTimezoneOffset()
      );
      const startTime = dateObject.toISOString().slice(0, 19);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-order`,
        {
          offering_id: offering._id,
          user_id: bookingUserId,
          date: selectedDate,
          slot: selectedSlot,
          startTime,
        }
      );

      if (response.data.r === "s") {
        console.log("Order Created:", response.data.data);
        if (offering.is_free) {
          setIsProcessing(false);
          setBookingDetails(response.data.data);
          setBookingSuccess(true);
          toast.success("Booking confirmed successfully!");
          tracking.trackUserAction("free_booking_confirmed", {
            offering_id: offering._id,
            offering_title: offering.title,
            offering_type: offering.type,
            user_id: bookingUserId,
            booking_date: selectedDate?.toISOString(),
            booking_start_time: selectedSlot?.start,
            booking_end_time: selectedSlot?.end,
            phone: phoneWithoutFormatting,
            is_guest_user: !isLoggedIn,
          });
          return;
        }

        // Track payment initiation
        tracking.trackClick("payment_initiated", {
          offering_id: offering._id,
          offering_title: offering.title,
          offering_type: offering.type,
          amount: response.data.data.amount,
          currency: response.data.data.currency || "INR",
          order_id: response.data.data.id,
          user_id: bookingUserId,
          payment_method: "razorpay",
          is_guest_user: !isLoggedIn,
        });

        // Start Razorpay payment process
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: response.data.data.amount,
          currency: response.data.data.currency || "INR",
          name: "GuildUp",
          description: "Slot Booking Payment",
          order_id: response.data.data.id,
          handler: async (paymentResponse: any) => {
            console.log("Payment Success:", paymentResponse);
            const dateObject = new Date(selectedSlot.start);
            dateObject.setMinutes(
              dateObject.getMinutes() - dateObject.getTimezoneOffset()
            );
            const startTime = dateObject.toISOString().slice(0, 19);

            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                offering_id: offering._id,
                user_id: bookingUserId,
                startTime,
              }
            );

            if (response.data.r === "s") {
              setIsProcessing(false);
              setBookingDetails(response.data.data);
              setBookingSuccess(true);
              setTimeout(() => {
                toast.success("Booking confirmed successfully!");
              }, 300);
              console.log("Booking confirmed successfully!");
              tracking.trackUserAction("paid_booking_confirmed", {
                offering_id: offering._id,
                offering_title: offering.title,
                offering_type: offering.type,
                amount: response.data.data.amount,
                currency: response.data.data.currency || "INR",
                user_id: bookingUserId,
                booking_date: selectedDate?.toISOString(),
                booking_start_time: selectedSlot?.start,
                booking_end_time: selectedSlot?.end,
                payment_id: paymentResponse.razorpay_payment_id,
                order_id: paymentResponse.razorpay_order_id,
                is_guest_user: !isLoggedIn,
              });
            } else {
              toast.error("Payment verification failed");
              onClose();
            }
          },
          prefill: {
            name: name,
            email: email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        onClose();
        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayInstance.open();
      } else {
        console.error("Failed to create order:", response.data.message);
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      toast.error("Failed to process booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  const handlePayment = async (orderId: string) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway");
      return;
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: offering.price.amount * 100,
      currency: offering.price.currency,
      name: "GuildUp",
      description: `Booking for ${offering.title}`,
      order_id: orderId,
      handler: (response: RazorpayResponse) => {
        handlePaymentVerification(response);
      },
      prefill: {
        name: name,
        email: email,
      },
      notes: {
        offering_id: offering._id,
      },
      theme: {
        color: "#2563EB",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const handlePaymentVerification = async (paymentResponse: any) => {
    try {
      console.log("Payment response:", paymentResponse);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/v1/payment/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          user_id: currentUserId,
          offering_id: offering._id,
          startTime: selectedSlot!.start,
        }
      );

      if (response.data.booking) {
        setIsProcessing(false);
        setBookingDetails(response.data.booking);
        setBookingSuccess(true);
        toast.success("Booking confirmed successfully!");
        console.log("Booking confirmed successfully!");
        tracking.trackUserAction("paid_booking_confirmed_v2", {
          offering_id: offering._id,
          offering_title: offering.title,
          offering_type: offering.type,
          user_id: currentUserId,
          booking_start_time: selectedSlot!.start,
          payment_id: paymentResponse.razorpay_payment_id,
          order_id: paymentResponse.razorpay_order_id,
          is_guest_user: !isLoggedIn,
        });
      } else {
        toast.error("Payment verification failed");
        onClose();
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      onClose();
    }
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="flex justify-center items-center">
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-y-auto max-h-[100vh] text-muted border border-border/50 rounded-xl shadow-xl">
          <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Section - Welcome Panel */}
            <div className="p-8 flex flex-col items-center text-center border-r border-border/20">
              <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-muted font-bold text-lg text-center">
                  <span className="text-xl">
                    You&apos;re Booking
                    <br />
                  </span>
                  <span className="text-primary font-semibold">
                    {offering.title}
                  </span>
                </h1>
                {offering.type === "webinar" && (
                  <div className="flex justify-between items-center mt-4 w-full bg-blue-100 font-bold px-4 py-2 rounded-md shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BsCalendarCheck className="h-5 w-5 text-blue-500" />
                      <span>
                        {offering.when
                          ? new Date(offering.when).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "No date set"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {offering.when
                        ? new Date(offering.when).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                )}

                <div className="relative w-28 h-28 mx-auto my-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-full blur-lg opacity-60"></div>
                  <img
                    src={
                      avatarImgUrl ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=adarsh" ||
                      "/placeholder.svg"
                    }
                    alt="User"
                    className="relative w-full h-full object-cover rounded-full border-4 border-background shadow-md"
                  />
                  {activeCommunityData?.user?.user_isBankDetailsAdded && (
                    <RiVerifiedBadgeFill className="absolute -right-1 top-3/4 transform -translate-y-1/2 translate-x-1/2 h-10 w-10 text-primary drop-shadow-md bg-white rounded-full" />
                  )}
                </div>

                <div className="text-center space-y-2">
                  <h1 className="font-bold">
                    {activeCommunityData?.community?.name}
                  </h1>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <BiSolidOffer className="h-5 w-5 text-green-600" />
                    {offering?.type.toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-4 px-4 py-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  {activeCommunityData?.user?.user_year_of_experience && (
                    <div className="flex items-center gap-3 border-b py-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-amber-500"
                      >
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">
                          Years of Experience
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {activeCommunityData?.user?.user_year_of_experience}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeCommunityData?.user?.user_session_conducted && (
                    <div className="flex items-center gap-3 border-b py-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-violet-500"
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">
                          Sessions Conducted
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {activeCommunityData?.user?.user_session_conducted}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-2" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Duration</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {offering.duration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <FaRupeeSign className="w-5 h-5 text-green-500 mx-2" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Price</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {offering.price.amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Booking Panel */}
            <div className="p-6 bg-background pb-auto overflow-y-auto mb-16">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-center">
                  {isLoggedIn
                    ? "Fill Basic Information for Booking"
                    : "Register & Book"}
                </DialogTitle>
              </DialogHeader>

              <AnimatePresence mode="wait">
                {bookingStep === "date" && (
                  <motion.div
                    key="date-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 bg-card"
                  >
                    <div className="bg-card/30 p-4 rounded-lg border border-border/30 shadow-sm flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="rounded-md border-none shadow-none"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  </motion.div>
                )}

                {bookingStep === "time" && (
                  <motion.div
                    key="time-selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Available Slots
                      </h3>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleBackToCalendar}
                        className="flex items-center gap-1 text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Change Date
                      </Button>
                    </div>

                    <div className="bg-card/30 p-4 rounded-lg border border-border/30 shadow-sm">
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary/70" />
                        {format(selectedDate!, "PPP")}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {filteredSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="text-sm transition-all duration-200 hover:scale-105 hover:bg-primary/10"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {bookingStep === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-card/30 p-6 rounded-lg space-y-6 shadow-sm border border-border/30">
                      <div className="space-y-4">
                        {!isLoggedIn && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="guest-name">
                                Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="guest-name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Enter your name"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="guest-email">
                                Email <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="guest-email"
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                              />
                            </div>
                          </>
                        )}

                        {isLoggedIn && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={name}
                                className="w-full p-2 shadow-md border border-border/30 rounded-md"
                                type="text"
                                placeholder="Enter your name"
                                disabled
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                value={email}
                                className="w-full p-2 shadow-md border border-border/30 rounded-md"
                                type="email"
                                placeholder="Enter your email"
                                disabled
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={phone}
                            onChange={(value) => setPhone(value || "")}
                            className="w-full p-2 shadow-md border border-border/30 rounded-md"
                            required
                            placeholder="Enter your phone number"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your WhatsApp number is required for booking
                            confirmation & reminders.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleBookSlot}
                        className="bg-primary w-full hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                            {!isLoggedIn
                              ? "Registering & Booking..."
                              : "Processing..."}
                          </>
                        ) : (
                          <>
                            {!isLoggedIn
                              ? "Register & Confirm Booking"
                              : "Confirm Booking"}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </div>

      {bookingSuccess && (
        <Dialog
          open={bookingSuccess}
          onOpenChange={() => {
            setBookingSuccess(false);
            onClose();
          }}
        >
          <DialogContent className="sm:max-w-sm md:max-w-xl p-6 bg-card rounded-xl shadow-xl border border-border/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Booking Confirmed!
              </DialogTitle>
              <p className="text-muted-foreground mt-2">
                Your booking has been successfully confirmed.
                {!isLoggedIn &&
                  " You have been registered and can now access your bookings."}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-background p-4 rounded-lg">
                <h2 className="text-center font-semibold">Booking Details</h2>

                <div>
                  <p className="text-muted-foreground">Service Name</p>
                  <p className="font-medium">{offering.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {selectedDate ? format(selectedDate, "PPP") : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {selectedSlot
                        ? `${formatTime(selectedSlot.start)} - ${formatTime(
                            selectedSlot.end
                          )}`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{offering.duration} minutes</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {offering.price.currency}{" "}
                      {offering.discounted_price !== null &&
                      offering.discounted_price !== undefined
                        ? offering.discounted_price
                        : offering.price.amount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setBookingSuccess(false);
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setBookingSuccess(false);
                  onClose();
                  window.location.href = "/booking";
                }}
              >
                Go to Bookings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
