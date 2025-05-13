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
import {
  loadRazorpayScript,
  type RazorpayOptions,
  type RazorpayResponse,
} from "@/components/utils/razorpay";
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
      // First, submit user information to wati API
      const phoneWithoutFormatting = phone.replace(/\D/g, ""); // Remove all non-digit characters

      // Make sure phone has country code without + or spaces
      if (!phoneWithoutFormatting) {
        toast.error("Phone number is required");
        setIsProcessing(false);
        return;
      }

      // Submit user information to wati API
      const watiResponse = await axios.post(
        "http://localhost:8000/v1/profile/wati/addContact",
        {
          userId: userId,
          phone: phoneWithoutFormatting,
        }
      );

      if (!watiResponse.data.data?.watiSync?.success) {
        toast.error("Failed to register phone number");
        setIsProcessing(false);
        return;
      }

      // Add your booking API call here
      const dateObject = new Date(selectedSlot.start);

      // Adjust for IST (UTC +5:30)
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
        }
      );

      if (response.data.r === "s") {
        console.log("Order Created:", response.data.data);
        if (offering.is_free) {
          setIsProcessing(false);
          // Store booking details and show success modal
          setBookingDetails(response.data.data);
          setBookingSuccess(true);
          toast.success("Booking confirmed successfully!");
          return;
        }
        // Start Razorpay payment process
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Razorpay Key ID (from env)
          amount: response.data.data.amount, // Amount in paisa (100 INR = 10000)
          currency: response.data.data.currency || "INR",
          name: "GuildUp", // Your business name
          description: "Slot Booking Payment",
          order_id: response.data.data.id, // Razorpay order ID from backend
          handler: async (paymentResponse: any) => {
            console.log("Payment Success:", paymentResponse);
            // After successful payment, call your backend to verify the payment
            const dateObject = new Date(selectedSlot.start);

            // Adjust for IST (UTC +5:30)
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
                user_id: userId, // Replace with actual user ID
                startTime,
              }
            );

            if (response.data.r === "s") {
              setIsProcessing(false);
              // Store booking details and show success modal
              setBookingDetails(response.data.data);
              setBookingSuccess(true);
              setTimeout(() => {
                toast.success("Booking confirmed successfully!");
              }, 300);
              console.log("Booking confirmed successfully!");
              // Don't close the dialog here
            } else {
              toast.error("Payment verification failed");
              onClose();
            }
          },
          theme: {
            color: "#3399cc",
          },
        };

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
      handler: (response: RazorpayResponse) => {
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

  const handlePaymentVerification = async (paymentResponse: any) => {
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
          startTime: selectedSlot!.start,
        }
      );

      if (response.data.booking) {
        // Don't close the dialog here
        setIsProcessing(false);
        // Store booking details and show success modal
        setBookingDetails(response.data.booking);
        setBookingSuccess(true);
        toast.success("Booking confirmed successfully!");
        console.log("Booking confirmed successfully!");
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
      <div className="flex justify-center items-center  ">
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-y-auto max-h-[100vh] text-muted  border border-border/50 rounded-xl shadow-xl  ">
          <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-0 ">
            {/* Left Section - Welcome Panel */}
            <div className="p-8 flex flex-col items-center text-center border-r border-border/20">
              <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg w-full max-w-sm">
                {/* Title */}
                <h1 className="text-muted font-bold text-2xl">
                  Hello {user?.name}
                </h1>

                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto my-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-full blur-lg opacity-60"></div>
                  <img
                    src={
                      activeCommunity?.image ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=adarsh" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
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
                {/* Details (Duration & Price) */}
                <div className="grid grid-cols-2 gap-4 w-full mt-4 px-2 py-4 bg-primary-muted/20 rounded-lg">
                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">
                        {offering.duration} min
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <FaRupeeSign className="h-5 w-5 text-green-500 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">
                        {offering.discounted_price || offering.price.amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Booking Panel */}
            <div className="p-6 bg-background">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold  text-center">
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
                      {/* <div className="space-y-3">
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
                      </div> */}

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

                      {/* <div className="space-y-3 pt-2 border-t border-border/30"> */}
                      {/* <h3 className="font-semibold text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Offering Details
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {offering.description}
                        </p> */}

                      {/* <div className="grid grid-cols-2 gap-2 pt-2"> */}
                      {/* <div className="bg-background/50 p-3 rounded-md flex items-center gap-2"> */}
                      {/* <Clock className="w-4 h-4 text-primary/70" /> */}
                      {/* <div>
                              <p className="text-xs text-muted-foreground">
                                Duration
                              </p>
                              <p className="text-sm font-medium">
                                {offering.duration} minutes
                              </p>
                            </div> */}
                      {/* </div> */}
                      {/* <div className="bg-background/50 p-3 rounded-md flex items-center gap-2"> */}
                      {/* <FaRupeeSign className="h-5 w-5 text-green-500" /> */}
                      {/* <div> */}
                      {/* <p className="text-xs text-muted-foreground"> */}
                      {/* Price */}
                      {/* </p> */}
                      {/* <p className="text-sm font-medium"> */}
                      {/* {offering.price.currency}{" "} */}
                      {/* {offering.discounted_price || */}
                      {/* offering.price.amount} */}
                      {/* </p> */}
                      {/* </div> */}
                      {/* </div> */}
                      {/* </div> */}
                      {/* </div> */}
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
                        className="bg-primary  hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
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
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-background p-4 rounded-lg">
                <h2 className="text-center font-semibold">Booking Detaills </h2>

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
                      {offering.discounted_price || offering.price.amount}
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
