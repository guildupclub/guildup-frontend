"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { GoDotFill } from "react-icons/go";
import { loadRazorpayScript } from "@/components/utils/razorpay";
import { motion, AnimatePresence } from "framer-motion";
import { FaRupeeSign } from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const user = useSelector((state: RootState) => state.user.user);
  const name = user?.name || "";
  const email = user?.email || "";

  // Debug state changes
  useEffect(() => {
    console.log("BookingDialog State:", {
      bookingSuccess,
      isOpen,
      bookingDetails,
    });
  }, [bookingSuccess, isOpen, bookingDetails]);

  // Load Razorpay script on mount
  useEffect(() => {
    const loadScript = async () => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error("Failed to load Razorpay script on mount");
      }
    };
    loadScript();
  }, []);

  // Set webinar-specific date and slot
  useEffect(() => {
    if (!offering) return;

    if (offering.type === "webinar") {
      console.log("Setting webinar date and slot:", offering.when);
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
      console.log("Fetching available slots for date:", formattedDate);
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
      toast.error("Failed to fetch available slots");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowConfirmation(false);
    if (date) {
      fetchAvailableSlots(date);
      setBookingStep("time");
    }
  };

  const handleBackToCalendar = () => {
    console.log("Returning to calendar view");
    setBookingStep("date");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    console.log("Slot selected:", slot);
    setSelectedSlot(slot);
    setShowConfirmation(true);
    setBookingStep("confirmation");
  };

  const filteredSlots = availableSlots.filter((slot) => {
    const startHour = new Date(slot.start).getHours();
    return startHour >= 11 && startHour < 20; // 11 AM to 8 PM
  });

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  const handleBookSlot = async () => {
    setIsProcessing(true);
    if (!selectedDate || !selectedSlot) {
      console.error("Missing date or slot:", { selectedDate, selectedSlot });
      toast.error("Please select a date and time slot");
      setIsProcessing(false);
      return;
    }

    try {
      // Validate and submit phone number to Wati API
      const phoneWithoutFormatting = phone.replace(/\D/g, "");
      if (!phoneWithoutFormatting) {
        console.error("Phone number is empty");
        toast.error("Phone number is required");
        setIsProcessing(false);
        return;
      }

      console.log("Submitting Wati API with phone:", phoneWithoutFormatting);
      const watiResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/profile/wati/addContact`,
        {
          userId: userId,
          phone: phoneWithoutFormatting,
        }
      );

      if (!watiResponse.data.data?.watiSync?.success) {
        console.error("Wati API failed:", watiResponse.data);
        toast.error("Failed to register phone number");
        setIsProcessing(false);
        return;
      }

      // Create booking order
      const dateObject = new Date(selectedSlot.start);
      dateObject.setMinutes(
        dateObject.getMinutes() - dateObject.getTimezoneOffset()
      );
      const startTime = dateObject.toISOString().slice(0, 19);

      console.log("Creating order with payload:", {
        offering_id: offering._id,
        user_id: userId,
        date: selectedDate,
        slot: selectedSlot,
        startTime,
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-order`,
        {
          offering_id: offering._id,
          user_id: userId,
          date: selectedDate,
          slot: selectedSlot,
          startTime,
        }
      );

      if (response.data.r === "s") {
        console.log("Order Created Successfully:", response.data.data);
        if (offering.is_free) {
          if (response.data.data) {
            console.log(
              "Setting booking details for free offering:",
              response.data.data
            );
            setBookingDetails(response.data.data);
            setBookingSuccess(true);
            toast.success("Booking confirmed successfully!");
          } else {
            console.error(
              "Invalid response data for free offering:",
              response.data
            );
            toast.error("Failed to process free booking");
            onClose();
          }
          setIsProcessing(false);
          return;
        }

        // Ensure Razorpay script is loaded
        console.log("Loading Razorpay script...");
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          console.error("Razorpay script failed to load");
          toast.error("Failed to load payment gateway");
          setIsProcessing(false);
          onClose();
          return;
        }

        // Initiate Razorpay payment for paid offerings
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: response.data.data.amount,
          currency: response.data.data.currency || "INR",
          name: "GuildUp",
          description: "Slot Booking Payment",
          order_id: response.data.data.id,
          handler: async (paymentResponse: any) => {
            try {
              console.log("Razorpay Payment Response:", paymentResponse);
              const verifyResponse = await Promise.race([
                axios.post(
                  `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
                  {
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    offering_id: offering._id,
                    user_id: userId,
                    startTime,
                  }
                ),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Verification timeout")),
                    10000
                  )
                ),
              ]);

              const verifyData = (verifyResponse as { data: any }).data;
              console.log(
                "Payment Verification Response:",
                verifyData
              );
              if (verifyData.r === "s") {
                console.log("Payment verified, setting booking success...");
                setBookingDetails(verifyData.data);
                setBookingSuccess(true);
                toast.success("Booking confirmed successfully!");
              } else {
                console.error(
                  "Payment verification failed:",
                  verifyData.message
                );
                toast.error(
                  "Payment verification failed: " + verifyData.message
                );
                onClose();
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast.error(
                "Failed to verify payment: " +
                  (error.message || "Unknown error")
              );
              onClose();
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: phoneWithoutFormatting,
          },
          theme: {
            color: "#3399cc",
          },
        };

        console.log("Opening Razorpay modal with options:", razorpayOptions);
        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayInstance.open();
      } else {
        console.error("Order creation failed:", response.data.message);
        toast.error("Failed to create order: " + response.data.message);
        onClose();
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      toast.error(
        "Failed to process booking: " + (error.message || "Unknown error")
      );
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="flex justify-center items-center">
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-y-auto max-h-[100vh] text-muted border border-border/50 rounded-xl shadow-xl">
          <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Section - Welcome Panel */}
            <div className="p-8 flex flex-col items-center text-center border-r border-border/20">
              <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-muted font-bold text-2xl">
                  Hello {user?.name}
                </h1>
                <div className="relative w-24 h-24 mx-auto my-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-full blur-lg opacity-60"></div>
                  <img
                    src={
                      activeCommunity?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        user?.name || "adarsh"
                      }`
                    }
                    alt="User"
                    className="relative w-full h-full object-cover rounded-full border-4 border-background shadow-md"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-primary">
                    Booking {offering.title}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <GoDotFill className="w-3 h-3" />
                    {offering?.type}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4 px-2 py-4 bg-primary-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">
                        {offering.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRupeeSign className="h-5 w-5 text-green-500 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">
                        {offering.discounted_price !== null &&
                        offering.discounted_price !== undefined
                          ? offering.discounted_price
                          : offering.price.amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Booking Panel */}
            <div className="p-6 bg-background">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-center">
                  Fill Basic Information for Booking
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
                        <div className="space-y-2">
                          <label htmlFor="phone" className="font-medium">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={phone}
                            onChange={setPhone}
                            className="w-full p-2 shadow-md border border-border/30 rounded-md"
                            required
                            placeholder="Enter your phone number"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your phone number is required for booking
                            confirmation
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="name">Name</label>
                          <input
                            id="name"
                            value={name}
                            className="w-full p-2 shadow-md border border-border/30 rounded-md"
                            type="text"
                            placeholder="Enter your name"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email">Email</label>
                          <input
                            id="email"
                            value={email}
                            className="w-full p-2 shadow-md border border-border/30 rounded-md"
                            type="email"
                            placeholder="Enter your email"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log("Back button clicked");
                          setShowConfirmation(false);
                          setBookingStep("time");
                        }}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button
                        onClick={handleBookSlot}
                        className="bg-primary hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Confirm Booking
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
            console.log("Closing confirmation dialog");
            setBookingSuccess(false);
            setBookingDetails(null);
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
                  console.log("Close button clicked");
                  setBookingSuccess(false);
                  setBookingDetails(null);
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  console.log("Go to Bookings button clicked");
                  setBookingSuccess(false);
                  setBookingDetails(null);
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
