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
    <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
      <DialogHeader>
        <DialogTitle>Book {offering.title}</DialogTitle>
      </DialogHeader>

      {!showConfirmation ? (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />

          {selectedDate && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Available Slots</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`text-sm ${selectedSlot === slot ? "bg-primary text-primary-foreground" : ""
                      }`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-background p-4 rounded-lg space-y-3">
            <div>
              <h3 className="font-medium">Selected Date & Time</h3>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate!, "PPP")}
                <br />
                {formatTime(selectedSlot!.start)} - {formatTime(selectedSlot!.end)}
              </p>
            </div>

            <div>
              <h3 className="font-medium">Offering Details</h3>
              <p className="text-sm text-muted-foreground">{offering.description}</p>
              <p className="text-sm font-medium mt-2">
                Duration: {offering.duration} minutes
              </p>
              <p className="text-sm font-medium">
                Price: {offering.price.currency} {offering.price.amount}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Back
            </Button>
              <Button
                onClick={handleBookSlot}
                className="bg-primary-gradient"
                disabled={isProcessing}
              >Confirm Booking
                {isProcessing ? "Processing..." : "Confirm Booking"}
              </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
}