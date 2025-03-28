"use client";

import type React from "react";

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
import {
  CalendarIcon,
  Clock,
  FileText,
  DollarSign,
  ChevronLeft,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { GoDotFill } from "react-icons/go";
import {
  loadRazorpayScript,
  RazorpayOptions,
  RazorpayResponse,
} from "@/components/utils/razorpay";
import { motion, AnimatePresence } from "framer-motion";
import { FaRupeeSign } from "react-icons/fa";
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
    duration: number;
  };
  isOpen: boolean;
  onClose: () => void;
}
// interface Offering {
//   title: string;
//   description: string;
//   duration: number;
//   price: {
//     currency: string;
//     amount: number;
//   };
// }

interface TimeSlot {
  start: string;
  end: string;
}

// interface BookingDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   offering: Offering;
// }

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
  const [bookingStep, setBookingStep] = useState<
    "date" | "time" | "confirmation"
  >("date");

  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const user = useSelector((state: RootState) => state.user.user);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
      fetchAvailableSlots(date);
      setBookingStep("time"); // Add this line to change the view to time slots
    }
  };

  const handleBackToCalendar = () => {
    setBookingStep("date");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
    setBookingStep("confirmation");
  };

  const filteredSlots = availableSlots.filter((slot) => {
    const startHour = new Date(slot.start).getHours();
    return startHour >= 11 && startHour < 20; // 11 AM to 8 PM
  });

  // const formatTime = (time: string) => {
  //   const [hours, minutes] = time.split(":");
  //   const date = new Date();
  //   date.setHours(Number.parseInt(hours));
  //   date.setMinutes(Number.parseInt(minutes));
  //   return format(date, "h:mm a");
  // };

  // console.log("offfafhgwfvj:    ", offering);

  const handleBookSlot = async () => {
    setIsProcessing(true);
    if (!selectedDate || !selectedSlot) {
      return;
    }

    try {
      // Add your booking API call here
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-order`,
        {
          offering_id: offering._id,
          date: selectedDate,
          slot: selectedSlot,
        }
      );

      if (response.data.success) {
        console.log("Order Created:", response.data.order);

        // Start Razorpay payment process
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Razorpay Key ID (from env)
          amount: response.data.order.amount, // Amount in paisa (100 INR = 10000)
          currency: response.data.order.currency || "INR",
          name: "GuildUp", // Your business name
          description: "Slot Booking Payment",
          order_id: response.data.order.id, // Razorpay order ID from backend
          handler: async function (paymentResponse: any) {
            console.log("Payment Success:", paymentResponse);
            // After successful payment, call your backend to verify the payment
            const dateObject = new Date(selectedSlot.start);

            // Adjust for IST (UTC +5:30)
            dateObject.setMinutes(
              dateObject.getMinutes() - dateObject.getTimezoneOffset()
            );
            const startTime = dateObject.toISOString().slice(0, 19);

            await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                offering_id: offering._id,
                user_id: userId, // Replace with actual user ID
                startTime,
              }
            );
            console.log("Payment Verified");
            // toast.success("Payment Successful! Booking confirmed.");
            alert("Payment Successful! Booking confirmed.");
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpayInstance = new window.Razorpay(razorpayOptions);
        onClose(); // closing the dialog before opening the payment gateway
        razorpayInstance.open();
      } else {
        console.error("Failed to create order:", response.data.message);
      }
    } catch (error) {
      console.error("Error booking slot:", error);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  // const [isProcessing, setIsProcessing] = useState(false);
  // const user = useSelector((state: RootState) => state?.user?.user);

  const handlePayment = async (orderId: string) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway");
      return;
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: offering.price.amount * 100, // Amount in smallest currency unit
      currency: offering.price.currency,
      name: "GuildUp",
      description: `Booking for ${offering.title}`,
      order_id: orderId,
      handler: function (response: RazorpayResponse) {
        handlePaymentVerification(response);
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
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

  const handlePaymentVerification = async (
    paymentResponse: RazorpayResponse
  ) => {
    try {
      console.log("Payment response:", paymentResponse);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/v1/payment/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          user_id: user?._id,
          offering_id: offering._id,
          // date: format(selectedDate!, "yyyy-MM-dd"),
          startTime: selectedSlot!.start,
          // end_time: selectedSlot!.end,
        }
      );

      if (response.data.booking) {
        toast.success("Booking confirmed successfully!");
        console.log("Booking confirmed successfully!");
        // alert("Booking confirmed successfully!");
        onClose();
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      // toast.error("Failed to verify payment");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // const handleBookSlot = async () => {
    //   if (!selectedDate || !selectedSlot) return;

    //   try {
    //     setIsProcessing(true);
    //     // Create Razorpay order
    //     const response = await axios.post(
    //       `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/v1/payment/create-order`,
    //       {
    //         amount: offering.price.amount,
    //         currency: offering.price.currency,
    //         offering_id: offering._id,
    //       }
    //     );

    //     if (response.data.success && response.data.order.id) {
    //       await handlePayment(response.data.order.id);
    //     } else {
    //       // toast.error("Failed to create payment order");
    //     }
    //   } catch (error) {
    //     console.error("Error creating order:", error);
    //     // toast.error("Failed to initiate payment");
    //   } finally {
    //     setIsProcessing(false);
    //   }
    // };

    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="flex justify-center items-center  ">
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-y-auto max-h-[100vh] text-muted  border border-border/50 rounded-xl shadow-xl  ">
          <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-0 ">
            {/* Left Section - Welcome Panel */}
            <div className="p-8 flex flex-col items-center text-center space-y-6 border-r border-border/20">
              <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg w-full max-w-sm h-auto">
                {/* Title */}
                <h1 className="text-muted font-bold text-2xl">
                  Hello {user?.name}
                </h1>

                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-full blur-lg opacity-60"></div>
                  <img
                    src={
                      activeCommunity?.image ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=adarsh"
                    }
                    alt="User"
                    className="relative w-full h-full object-cover rounded-full border-4 border-background shadow-md"
                  />
                </div>

                {/* User Name */}
                <div className="text-center">
                  <p className="text-xl font-semibold text-primary leading-tight">
                    Booking {offering.title}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <GoDotFill className="" />
                    {offering?.type}
                  </p>
                </div>

                {/* Details (Duration & Price) */}
                <div className="flex justify-between items-center w-full px-4 py-6">
                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">
                        {offering.duration} min
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <FaRupeeSign className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">
                        {/* {offering.price.currency} */}
                        {offering.discounted_price || offering.price.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* <p>{offering?.description}</p> */}
              </div>
            </div>

            {/* Right Section - Booking Panel */}
            <div className="p-6 bg-background">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold  text-center">
                  Choose your available time slot
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
                        className="rounded-md border-none shadow-none "
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
                        className="flex items-center gap-1 text-white "
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
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                          Selected Date & Time
                        </h3>
                        <div className="bg-background/50 p-3 rounded-md text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {format(selectedDate!, "PPP")}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/70" />
                            {formatTime(selectedSlot!.start)} -{" "}
                            {formatTime(selectedSlot!.end)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-border/30">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Offering Details
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {offering.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="bg-background/50 p-3 rounded-md flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/70" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Duration
                              </p>
                              <p className="text-sm font-medium">
                                {offering.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="bg-background/50 p-3 rounded-md flex items-center gap-2">
                            <FaRupeeSign className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Price
                              </p>
                              <p className="text-sm font-medium">
                                {/* {offering.price.currency}{" "} */}
                                {offering.discounted_price ||
                                  offering.price.amount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
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
                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
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
    </Dialog>
  );
}
