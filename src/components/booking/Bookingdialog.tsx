"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "../ui/calendar";
import { Button } from "@/components/ui/button";
import axios from 'axios';

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}
import { format } from "date-fns";

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

  const handleBookSlot = async () => {
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
      });

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
            dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
            const startTime = dateObject.toISOString().slice(0, 19);

            await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                offering_id: offering._id,
                user_id: "67bbce87db5470c98b22626d", // Replace with actual user ID
                startTime,
              }
            );
            console.log("Payment Verified");
            alert("Payment Successful! Booking confirmed.");
          },
          theme: {
            color: "#3399cc",
          },
        };
  
        const razorpayInstance = new window.Razorpay(razorpayOptions);
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
                      className={`text-sm ${
                        selectedSlot === slot ? "bg-primary text-primary-foreground" : ""
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
              <Button onClick={handleBookSlot} className="bg-primary-gradient">
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}