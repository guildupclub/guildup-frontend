"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { loadRazorpayScript, RazorpayOptions, RazorpayResponse } from "@/components/utils/razorpay";
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Clock, CalendarIcon, DollarSign } from "lucide-react"


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
    duration: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingDialog({ offering, isOpen, onClose }: BookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/available-slots?offering_id=${offering._id}&date=${formattedDate}`,
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
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);

  const handlePayment = async (orderId: string) => {
    
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      // toast.error("Failed to load payment gateway");
      return;
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: offering.price.amount * 100, // Amount in smallest currency unit
      currency: offering.price.currency,
      name: "GuildUp",
      description: `Booking for ${ offering.title }`,
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

const handlePaymentVerification = async (paymentResponse: RazorpayResponse) => {
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
      // toast.success("Booking confirmed successfully!");
      console.log("Booking confirmed successfully!");
      alert("Booking confirmed successfully!");
      onClose();
    } else {
      // toast.error("Payment verification failed");
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    // toast.error("Failed to verify payment");
  }
};

const handleBookSlot = async () => {
  if (!selectedDate || !selectedSlot) return;

  try {
    setIsProcessing(true);
    // Create Razorpay order
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/v1/payment/create-order`,
      {
        amount: offering.price.amount,
        currency: offering.price.currency,
        offering_id: offering._id,
      }
    );

    if (response.data.success && response.data.order.id) {
      await handlePayment(response.data.order.id);
    } else {
      // toast.error("Failed to create payment order");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    // toast.error("Failed to initiate payment");
  } finally {
    setIsProcessing(false);
  }
};

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-card to-card/80 text-foreground backdrop-blur-sm border border-border/50">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
          Book {offering.title}
        </DialogTitle>
      </DialogHeader>

      <AnimatePresence mode="wait">
        {!showConfirmation ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border border-border/50 shadow-lg"
              disabled={(date) => date < new Date()}
            />

            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Available Slots
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`text-sm transition-all duration-200 hover:scale-105 ${
                        selectedSlot === slot ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-background/50 p-6 rounded-lg space-y-4 shadow-inner">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Selected Date & Time
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate!, "PPP")}
                  <br />
                  {formatTime(selectedSlot!.start)} - {formatTime(selectedSlot!.end)}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Offering Details</h3>
                <p className="text-sm text-muted-foreground">{offering.description}</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Duration: {offering.duration} minutes
                </p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Price: {offering.price.currency} {offering.price.amount}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleBookSlot}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContent>
  </Dialog>
);
}