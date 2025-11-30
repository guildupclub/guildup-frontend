"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { primary } from "@/app/colours";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TimeSlot {
  start: string;
  end: string;
  booked?: boolean;
}

interface DaySlots {
  date: Date;
  slots: TimeSlot[];
}

// Hardcoded offering details
const CLARITY_CALL_OFFERING = {
  _id: "6926fb8dd5af85a7657d93b6",
  user_id: "682471d23c6d327b09ec26a5",
  community_id: "686d655a730ecc24bff4f75f",
  price: 299,
  duration: 40,
  type: "clarity-call",
};

export default function ClarityCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  // Get name and phone from URL params (if coming from wellness-check)
  const nameFromUrl = searchParams?.get("name") || "";
  const phoneFromUrl = searchParams?.get("phone") || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [daysWithSlots, setDaysWithSlots] = useState<DaySlots[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 0, minutes: 0 });

  // Prefill name and phone if coming from wellness-check
  useEffect(() => {
    if (nameFromUrl) {
      setName(nameFromUrl);
    }
    if (phoneFromUrl) {
      setPhone(phoneFromUrl);
    }
  }, [nameFromUrl, phoneFromUrl]);

  // Helper functions
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  const getTimeOfDay = (hour: number) => {
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  // Process slots: show slots at specific hours (12, 1, 4, 5, 6, 7 PM), mark 2-3 as available
  const processSlotsForDisplay = (slots: TimeSlot[], date: Date): TimeSlot[] => {
    const targetHours = [12, 13, 16, 17, 18, 19]; // 12 PM, 1 PM, 4 PM, 5 PM, 6 PM, 7 PM
    
    const filteredSlots = slots.filter((slot: TimeSlot) => {
      const slotDate = new Date(slot.start);
      const hour = slotDate.getHours();
      const minute = slotDate.getMinutes();
      return targetHours.includes(hour) && minute < 30;
    });

    filteredSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const dateSeed = date.getTime();
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const slotsByHour = new Map<number, TimeSlot[]>();
    filteredSlots.forEach((slot) => {
      const hour = new Date(slot.start).getHours();
      if (!slotsByHour.has(hour)) {
        slotsByHour.set(hour, []);
      }
      slotsByHour.get(hour)!.push(slot);
    });

    const selectedSlots: TimeSlot[] = [];
    targetHours.forEach((hour) => {
      const hourSlots = slotsByHour.get(hour) || [];
      if (hourSlots.length > 0) {
        const randomIndex = Math.floor(random(dateSeed + hour) * hourSlots.length);
        selectedSlots.push(hourSlots[randomIndex]);
      }
    });

    selectedSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const availableCount = selectedSlots.length >= 3
      ? Math.floor(random(dateSeed * 2) * 2) + 2 // 2 or 3 available
      : selectedSlots.length;

    const availableIndices = new Set<number>();
    const allIndices = [...Array(selectedSlots.length).keys()];
    
    for (let i = 0; i < availableCount && allIndices.length > 0; i++) {
      const randomIndex = Math.floor(random(dateSeed * 3 + i) * allIndices.length);
      const selectedIndex = allIndices.splice(randomIndex, 1)[0];
      availableIndices.add(selectedIndex);
    }

    return selectedSlots.map((slot, index) => ({
      ...slot,
      booked: !availableIndices.has(index),
    }));
  };

  const groupSlotsByTimeOfDay = (slots: TimeSlot[]) => {
    const grouped: { morning: TimeSlot[]; afternoon: TimeSlot[]; evening: TimeSlot[] } = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    slots.forEach((slot) => {
      const hour = new Date(slot.start).getHours();
      const timeOfDay = getTimeOfDay(hour);
      grouped[timeOfDay].push(slot);
    });

    return grouped;
  };

  // Fetch available slots for next 7 days
  useEffect(() => {
    setIsLoadingSlots(true);
    const fetchAllSlots = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const slotsPromises = [];
        for (let i = 1; i <= 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          date.setHours(0, 0, 0, 0);
          const formattedDate = format(date, "yyyy-MM-dd");

          slotsPromises.push(
            axios
              .get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/available-slots`, {
                params: {
                  offering_id: CLARITY_CALL_OFFERING._id,
                  date: formattedDate,
                },
              })
              .then((res) => {
                const processedSlots = processSlotsForDisplay(res.data || [], date);
                return { date, slots: processedSlots };
              })
              .catch((error) => {
                console.error(`Error fetching slots for ${formattedDate}:`, error);
                return { date, slots: [] };
              })
          );
        }

        const results = await Promise.all(slotsPromises);
        const daysWithSlotsData = results
          .filter((result) => result.slots.length > 0)
          .map((result) => ({
            date: result.date,
            slots: result.slots,
          }));

        setDaysWithSlots(daysWithSlotsData);

        // Auto-select first day and first available slot
        if (daysWithSlotsData.length > 0) {
          const firstDay = daysWithSlotsData[0];
          setSelectedDate(firstDay.date);
          const firstAvailableSlot = firstDay.slots.find((s: TimeSlot) => !s.booked) || firstDay.slots[0];
          if (firstAvailableSlot) {
            setSelectedSlot(firstAvailableSlot);
          }
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Failed to load available slots");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAllSlots();
  }, []);

  // Get grouped slots for selected date
  const groupedSlots = useMemo(() => {
    if (!selectedDate) return null;
    const dayData = daysWithSlots.find((day) => isSameDay(day.date, selectedDate));
    if (!dayData) return null;
    return groupSlotsByTimeOfDay(dayData.slots);
  }, [selectedDate, daysWithSlots]);

  // Handle booking
  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    if (selectedSlot.booked) {
      toast.error("This slot is already booked. Please select another time.");
      return;
    }

    if (!name || !phone) {
      toast.error("Please enter your name and phone number.");
      return;
    }

    setIsProcessing(true);

    try {
      const storedUser = sessionStorage.getItem("user");
      const bookingUserId = userId || (storedUser ? JSON.parse(storedUser)._id : undefined);

      if (!bookingUserId) {
        toast.error("Please log in to book a slot.");
        setIsProcessing(false);
        return;
      }

      const dateObject = new Date(selectedSlot.start);
      dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
      const startTime = dateObject.toISOString().slice(0, 19);

      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-simple-order`,
        {
          offering_id: CLARITY_CALL_OFFERING._id,
          user_id: bookingUserId,
          date: formattedDate,
          slot: selectedSlot,
          startTime,
        }
      );

      if (response.data.r === "s") {
        const order = response.data.data;

        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "GuildUp",
          description: "Clarity Call Booking",
          order_id: order.id,
          handler: async (paymentResponse: any) => {
            setIsRazorpayOpen(false);
            const verifyResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/verify-simple-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                offering_id: CLARITY_CALL_OFFERING._id,
                user_id: bookingUserId,
                startTime,
              }
            );

            if (verifyResponse.data.r === "s") {
              toast.success("Booking confirmed successfully!");
              router.push(
                `/booking-confirmation?bookingId=${verifyResponse.data.data._id}&title=Clarity Call&duration=${CLARITY_CALL_OFFERING.duration}&price=${CLARITY_CALL_OFFERING.price}&currency=INR&type=${CLARITY_CALL_OFFERING.type}&isFree=false&selectedDate=${selectedDate?.toISOString()}&selectedTime=${selectedSlot?.start}`
              );
            } else {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: (user?.name || name || "").trim(),
            contact: user?.phone || phone || "",
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
      } else {
        toast.error("Failed to create order");
      }
    } catch (error: any) {
      console.error("Error booking slot:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.e || error.message || "Failed to process booking";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFromWellnessCheck = !!nameFromUrl && !!phoneFromUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Pricing Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 rounded-xl p-6 sm:p-8 text-center shadow-lg"
          style={{ borderColor: primary }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm sm:text-base text-gray-600 mb-1">Limited Time Offer</p>
              <div className="text-lg sm:text-xl text-gray-500 line-through mb-2">Usually ₹1,999</div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold flex items-center justify-center gap-2 mb-2" style={{ color: primary }}>
                <FaRupeeSign className="w-8 h-8 sm:w-10 sm:h-10" />
                299
              </div>
              <div className="inline-block px-4 py-2 bg-red-500 text-white rounded-full text-sm sm:text-base font-semibold mb-4">
                Save 85%
              </div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 space-y-2">
              <p className="text-sm sm:text-base text-gray-700">
                This price is only available for the next{" "}
                <span className="font-bold text-lg sm:text-xl" style={{ color: primary }}>{timeLeft.days} days</span>.
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                After that, the price will revise to ₹1,999.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Book Your <span style={{ color: primary }}>40-Min</span> Clarity Call
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={isFromWellnessCheck}
                className={isFromWellnessCheck ? "bg-gray-50" : ""}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Phone</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                disabled={isFromWellnessCheck}
                className={isFromWellnessCheck ? "bg-gray-50" : ""}
                placeholder="Enter your phone number"
              />
              {isFromWellnessCheck && (
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>

            {/* Date Selection */}
            {isLoadingSlots ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading available slots...</p>
              </div>
            ) : daysWithSlots.length > 0 ? (
              <>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Select Date</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {daysWithSlots.slice(0, 3).map((day, idx) => {
                      const availableSlots = day.slots.filter((s: TimeSlot) => !s.booked).length;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDate(day.date);
                            if (day.slots.length > 0) {
                              const firstAvailableSlot = day.slots.find((s: TimeSlot) => !s.booked) || day.slots[0];
                              setSelectedSlot(firstAvailableSlot);
                            }
                          }}
                          className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm ${
                            selectedDate && isSameDay(day.date, selectedDate)
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="font-semibold">{format(day.date, "EEE")}</div>
                          <div className="text-[10px] sm:text-xs text-gray-600">{format(day.date, "MMM d")}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {availableSlots} {availableSlots === 1 ? "slot" : "slots"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && groupedSlots && (
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Select Time</Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        ...(groupedSlots.morning || []),
                        ...(groupedSlots.afternoon || []),
                        ...(groupedSlots.evening || []),
                      ].map((slot, idx) => {
                        const isBooked = slot.booked || false;
                        return (
                          <button
                            key={idx}
                            onClick={() => !isBooked && setSelectedSlot(slot)}
                            disabled={isBooked}
                            className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm transition-all ${
                              isBooked
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                : selectedSlot?.start === slot.start
                                ? "border-blue-600 bg-blue-50 font-semibold"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            title={isBooked ? "This slot is booked" : ""}
                          >
                            {formatTime(slot.start)}
                            {isBooked && <span className="block text-[10px] text-gray-500 mt-1">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>No available slots in the next 7 days.</p>
                <p className="text-sm text-gray-500 mt-2">Please check back later or contact support.</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Clarity Call</span>
                <span className="font-semibold">₹299</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                  <FaRupeeSign className="w-5 h-5" />
                  299
                </span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleBook}
              disabled={!selectedDate || !selectedSlot || isProcessing || selectedSlot?.booked || !name || !phone}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold py-4 sm:py-5 md:py-6 lg:py-7 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : selectedSlot?.booked ? "Slot Booked" : "Book My Clarity Call"}
            </Button>
            <p className="text-xs sm:text-sm text-center text-gray-600">
              Secure payment • Instant confirmation • 100% refund if not valuable
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

