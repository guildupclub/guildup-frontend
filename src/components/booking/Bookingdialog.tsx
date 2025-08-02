"use client";

import { useRouter } from "next/navigation";
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

import { CalendarIcon, Clock, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
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
import { useChatContext } from "@/contexts/ChatContext";
import { setUser } from "@/redux/userSlice";

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
  communityId?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingDialog({
  offering,
  isOpen,
  onClose,
  communityId,
}: BookingDialogProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Component State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingStep, setBookingStep] = useState<
    "date" | "time" | "confirmation"
  >("date");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [appliedCouponInfo, setAppliedCouponInfo] = useState(null);
  const [priceAfterDiscount, setPriceAfterDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  // User-related state (single source for form fields)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // OTP flow state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Redux state
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const isLoggedIn = !!reduxUser?._id;

  const { sendMessage, startNewChat } = useChatContext();
  const tracking = useTracking();
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [activeCommunityData, setActiveCommunityData] = useState<any>(null);

  const params = useParams();
  const communityParam = params?.["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityIdFromParam =
    lastHyphenIndex !== -1 && communityParam.substring(lastHyphenIndex + 1)
      ? communityParam.substring(lastHyphenIndex + 1)
      : "683f18575411ca44bde8f746";
  const effectiveCommunityId = communityId || communityIdFromParam;

  // --- Main Logic --- //

  // Effect to synchronize local form state with Redux user state
  useEffect(() => {
    if (isLoggedIn && reduxUser) {
      setName(reduxUser.name || "");
      setEmail(reduxUser.email || "");
      if (reduxUser.phone) {
        setPhone(
          reduxUser.phone.startsWith("+")
            ? reduxUser.phone
            : `+${reduxUser.phone}`
        );
      } else {
        setPhone("");
      }
    }
  }, [isLoggedIn, reduxUser]);

  const handleSendOtp = async () => {
    if (!phone || !name || !email) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/request-otp`,
        { phone: phone.replace("+", "") }
      );
      if (response.data.r === "s") {
        setOtpSent(true);
        toast.success("OTP sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/verify-otp`,
        {
          phone: phone.replace("+", ""),
          name,
          email,
          otp,
        }
      );
      if (response.data.r === "s") {
        toast.success("Login successful!");
        const { user, token } = response.data.data;

        // Store user data and token in session storage to match main login flow
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("name", user.name);
        sessionStorage.setItem("id", user._id);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("email", user.email);

        dispatch(
          setUser({
            user,
            token,
          })
        );
        // Pre-fill form with user data from backend
        setName(user.name || "");
        setEmail(user.email || "");
        if (user.phone) {
          setPhone(user.phone.startsWith("+") ? user.phone : `+${user.phone}`);
        }
        setOtp("");
        setOtpSent(false);
      } else {
        toast.error(response.data.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a valid coupon code.");
      return;
    }
    try {
      const storedUser = sessionStorage.getItem("user");
      const userId = reduxUser?._id || (storedUser ? JSON.parse(storedUser)._id : undefined);

      if (!userId) {
        toast.error("Please log in to apply a coupon.");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/coupon/preview`,
        {
          code: couponCode.trim().toUpperCase(),
          userId: userId,
          cartTotal: offering.price.amount,
          offeringId: offering._id,
        }
      );
      if (response.data.valid) {
        setAppliedCouponInfo(response.data);
        setPriceAfterDiscount(response.data.finalTotal);
        setCouponMessage(response.data.message);
        setAppliedCouponCode(couponCode.trim().toUpperCase());
      } else {
        setCouponMessage(response.data.message);
        setAppliedCouponInfo(null);
        setPriceAfterDiscount(offering.price.amount);
      }
    } catch (error) {
      setCouponMessage(
        (error as any)?.response?.data?.message || "Error validating coupon."
      );
      setAppliedCouponInfo(null);
      setPriceAfterDiscount(offering.price.amount);
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["communityProfile", communityIdFromParam],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: effectiveCommunityId,
        }
      );
      setActiveCommunityData(response.data.data);
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
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!offering) return;
    setPriceAfterDiscount(offering.price.amount);
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
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) {
      tracking.trackClick("booking_date_selected", {
        offering_id: offering._id,
        selected_date: date.toISOString(),
        user_id: reduxUser?._id,
      });
      fetchAvailableSlots(date);
      setBookingStep("time");
    }
  };

  const handleBackToCalendar = () => {
    setBookingStep("date");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    tracking.trackClick("booking_time_slot_selected", {
      offering_id: offering._id,
      selected_slot_start: slot.start,
      user_id: reduxUser?._id,
    });
    setSelectedSlot(slot);
    setBookingStep("confirmation");
  };

  const filteredSlots = availableSlots.filter((slot) => {
    const startHour = new Date(slot.start).getHours();
    return startHour >= 11 && startHour < 20; // 11 AM to 8 PM
  });

  const handleBookSlot = async () => {
    tracking.trackClick("confirm_booking_button", {
      offering_id: offering._id,
      is_guest_user: !isLoggedIn,
    });

    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    setIsProcessing(true);

    try {
      const phoneWithoutFormatting = phone.replace(/\D/g, "");
      if (!phoneWithoutFormatting) {
        toast.error("Phone number is required");
        setIsProcessing(false);
        return;
      }

      const storedUser = sessionStorage.getItem("user");
      const userId = reduxUser?._id || (storedUser ? JSON.parse(storedUser)._id : undefined);

      if (!userId) {
        toast.error("Please log in to book a slot.");
        setIsProcessing(false);
        return;
      }

      const watiResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/profile/wati/addContact`,
        {
          userId: userId,
          phone: phoneWithoutFormatting,
        }
      );

      if (!watiResponse.data.data?.watiSync?.success) {
        console.warn("Failed to register phone number with Wati");
      }

      const dateObject = new Date(selectedSlot.start);
      dateObject.setMinutes(
        dateObject.getMinutes() - dateObject.getTimezoneOffset()
      );
      const startTime = dateObject.toISOString().slice(0, 19);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-order`,
        {
          offering_id: offering._id,
          user_id: userId,
          date: selectedDate,
          slot: selectedSlot,
          startTime,
          couponCode: appliedCouponCode,
        }
      );

      if (response.data.r === "s") {
        const order = response.data.data;
        if (appliedCouponInfo) {
          setPriceAfterDiscount(appliedCouponInfo.finalTotal);
        } else {
          setPriceAfterDiscount(offering.price.amount);
        }
        if (offering.is_free || order.amount === 0) {
          toast.success("Booking confirmed successfully!");
          onClose();
          router.push(
            `/booking-confirmation?bookingId=${order._id}&title=${offering.title}&duration=${offering.duration}&price=${offering.price.amount}&currency=${offering.price.currency}&type=${offering.type}&isFree=true&providerName=${activeCommunityData?.community?.name}&selectedDate=${selectedDate?.toISOString()}&selectedTime=${selectedSlot?.start}`
          );
        } else {
          const razorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency || "INR",
            name: "GuildUp",
            description: "Slot Booking Payment",
            order_id: order.id,
            handler: async (paymentResponse: any) => {
              setIsRazorpayOpen(false);
              const verifyResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
                {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  offering_id: offering._id,
                  user_id: userId,
                  startTime,
                  couponCode: appliedCouponCode,
                }
              );

              if (verifyResponse.data.r === "s") {
                toast.success("Booking confirmed successfully!");
                onClose();
                router.push(
                  `/booking-confirmation?bookingId=${verifyResponse.data.data._id}&title=${offering.title}&duration=${offering.duration}&price=${offering.price.amount}&currency=${offering.price.currency}&type=${offering.type}&isFree=false&providerName=${activeCommunityData?.community?.name}&selectedDate=${selectedDate?.toISOString()}&selectedTime=${selectedSlot?.start}`
                );
              } else {
                toast.error("Payment verification failed");
                onClose();
              }
            },
            prefill: {
              name: name,
              email: email,
              contact: phone,
            },
            theme: {
              color: "#3399cc",
            },
            modal: {
              ondismiss: () => {
                setIsRazorpayOpen(false);
              },
            },
          };
          const razorpayInstance = new window.Razorpay(razorpayOptions);
          setIsRazorpayOpen(true);
          razorpayInstance.open();
        }
      } else {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isRazorpayOpen}>
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
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.user.user_name}` ||
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
                {activeCommunityData?.user?.user_year_of_experience > 0 ? (
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
                ) : null}

                {activeCommunityData?.user?.user_session_conducted > 0 ? (
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
                ) : null}

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
                    {appliedCouponInfo ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500 text-sm">
                          ₹{offering.price.amount}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          ₹{priceAfterDiscount}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">
                        ₹{offering.price.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Booking Panel */}
          <div className="p-6 bg-background pb-auto overflow-y-auto mb-16">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">
                {isLoggedIn ? "Confirm Your Details" : "Register & Book"}
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
                      {selectedDate && format(selectedDate, "PPP")}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {filteredSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-sm transition-all duration-200 hover:scale-105 hover:bg-primary/10 bg-transparent"
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
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-2 shadow-md border border-border/30 rounded-md"
                          type="text"
                          placeholder="Enter your name"
                          disabled={isLoggedIn || otpSent}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-2 shadow-md border border-border/30 rounded-md"
                          type="email"
                          placeholder="Enter your email"
                          disabled={isLoggedIn || otpSent}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={phone}
                            onChange={(value) => setPhone(value || "")}
                            className="w-full p-2 shadow-md border border-border/30 rounded-md"
                            required
                            placeholder="Enter your phone number"
                            disabled={isLoggedIn || otpSent}
                          />
                          {!isLoggedIn && !otpSent && (
                            <Button
                              onClick={handleSendOtp}
                              disabled={!phone || !name || !email}
                            >
                              Send OTP
                            </Button>
                          )}
                        </div>
                      </div>

                      {!isLoggedIn && otpSent && (
                        <div className="space-y-2 rounded-lg bg-primary/5 p-4">
                          <Label htmlFor="otp">
                            Enter OTP <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="otp"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="6-digit OTP"
                              required
                              className="flex-1"
                            />
                            <Button
                              onClick={handleVerifyOtp}
                              className="bg-primary"
                            >
                              Verify & Login
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Didn&apos;t receive it?{" "}
                            <button
                              onClick={handleSendOtp}
                              className="text-primary hover:underline"
                            >
                              Resend OTP
                            </button>
                          </p>
                        </div>
                      )}

                      {isLoggedIn && (
                        <p className="text-xs text-muted-foreground">
                          Your WhatsApp number is required for booking
                          confirmation & reminders.
                        </p>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="couponCode"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Coupon Code
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="couponCode"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            placeholder="Enter coupon code"
                            className="flex-1 p-2 border border-border/30 rounded-lg text-sm uppercase"
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            className="px-4 bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
                          >
                            Apply
                          </Button>
                        </div>
                        {couponMessage && (
                          <p
                            className={`text-sm ${
                              appliedCouponInfo
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {couponMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleBookSlot}
                      className="bg-primary w-full hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
                      disabled={isProcessing || !(isLoggedIn || (typeof window !== 'undefined' && window.sessionStorage.getItem('token')))}
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                          Booking...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
