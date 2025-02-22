"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import axios from 'axios';
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

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/calendar/booking/available-slots`,
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
    if (!selectedDate || !selectedSlot) return;

    try {
      // Add your booking API call here
      console.log("Booking slot:", {
        offering_id: offering._id,
        date: selectedDate,
        slot: selectedSlot,
      });
      onClose();
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