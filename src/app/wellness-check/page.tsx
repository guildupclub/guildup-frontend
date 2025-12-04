"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setUser } from "@/redux/userSlice";
import { Button } from "@/components/ui/button";
import { PHQ9 } from "@/lib/assessments/phq9";
import { computePhq9Score, type Phq9Answers } from "@/lib/assessments/scoring";
import { AnimatePresence, motion } from "framer-motion";
import { format, addDays, isSameDay } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { Clock, CheckCircle2, Sparkles, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sun, Sunset, Star, X, AlertCircle, ArrowDown } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getRandomLeadNurturingMessage } from "./utils/leadNurturingMessages";
import { saveToGoogleSheets } from "./utils/googleSheets";
import { useCachedCommunities } from "@/hooks/useCachedCommunities";
import { primary } from "@/app/colours";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";
import Loader from "@/components/Loader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = "cover" | "questions" | "name-phone" | "otp-verify" | "results";

interface TimeSlot {
  start: string;
  end: string;
  booked?: boolean; // Frontend-only: mark some slots as booked
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

export default function WellnessCheckPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const [step, setStep] = useState<Step>("cover");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<{ total: number; level: string; labels: string[] } | null>(null);
  const [recoveryDays, setRecoveryDays] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [daysWithSlots, setDaysWithSlots] = useState<DaySlots[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);
  
  // OTP flow state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [currentNurturingMessage, setCurrentNurturingMessage] = useState("");
  const [namePhoneStep, setNamePhoneStep] = useState<"name" | "phone">("name");

  const questions = useMemo(() => PHQ9.questions.map((q) => ({ id: String(q.id), text: q.text })), []);
  
  // Get coaches for results page
  const { data: communitiesData, loading: loadingCommunities } = useCachedCommunities({});
  const coaches = useMemo(() => {
    if (!communitiesData?.communities) return [];
    const allowedIds = [
      "6873fd21bb8cdb102a32e33c", // Annie
      "67e813849e012602676e0504", // Coach Jas
      "6814bb85ca1a0821767ee20b", // Heal with Bhakti
      "68527e2fa05733beb31e6380", // Shreya
      "685bcf2d76aa736a1c6853fe", // Khushi Tayal
      "681ddea3060002ed6eff7b2e", // Divya Mittar
    ];
    return communitiesData.communities
      .filter((c: any) => {
        const communityId = (c?.community?._id || c?._id) || "";
        return allowedIds.includes(communityId);
      })
      .slice(0, 3);
  }, [communitiesData]);

  // Testimonials data
  const testimonials = useMemo(() => [
    {
      quote: "I was 26 years old when I had my first panic attack. Just like any Indian family, my parents were not amused by the fact their son would be going for therapy. While I got care finally, I still see a significant level of stigma against mental health. I wish there was an easier way to access this.",
      author: "Rahul S.",
      location: "Mumbai, Maharashtra",
      rating: 5,
      date: "2 weeks ago",
      program: "Stress & Anxiety",
      verified: true,
    },
    {
      quote: "I am subjected to intrusive questions about my mental health issues from everyone at the store. GuildUp offers privacy and understanding, which helped me stay consistent with my sessions.",
      author: "Ankit K.",
      location: "Bangalore, Karnataka",
      rating: 5,
      date: "3 weeks ago",
      program: "Stress & Anxiety",
      verified: true,
    },
    {
      quote: "After months of struggling with anxiety, I finally found a platform that respects my privacy and provides genuine care. The sessions have been life-changing.",
      author: "Meera T.",
      location: "Kolkata, West Bengal",
      rating: 5,
      date: "4 weeks ago",
      program: "Stress & Anxiety",
      verified: true,
    },
  ], []);

  // Calculate recovery days based on score
  const calculateRecoveryDays = (total: number): number => {
    if (total <= 4) return 21; // Minimal - 3 weeks
    if (total <= 9) return 35; // Mild - 5 weeks
    if (total <= 14) return 49; // Moderate - 7 weeks
    if (total <= 19) return 63; // Moderately severe - 9 weeks
    return 84; // Severe - 12 weeks
  };

  // Handle question answer
  const handleAnswer = (value: string) => {
    const question = questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));

    // Show lead nurturing message randomly after 3-4 questions (not every question)
    // Show message after questions 3, 4, 6, or 7 (randomly)
    const shouldShowMessage = currentQuestionIndex >= 2 && 
      (currentQuestionIndex === 2 || currentQuestionIndex === 3 || 
       currentQuestionIndex === 5 || currentQuestionIndex === 6) &&
      Math.random() > 0.3; // 70% chance to show when on eligible questions

    if (shouldShowMessage) {
      const message = getRandomLeadNurturingMessage();
      
      // First wait a bit, then hide answer and show message
      setTimeout(() => {
        // Answer will be hidden because currentNurturingMessage is set
        setCurrentNurturingMessage(message);
        
        // After showing message for 3 seconds, hide it and move to next question
        setTimeout(() => {
          setCurrentNurturingMessage("");
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((i) => i + 1);
          } else {
            handleSubmit();
          }
        }, 3000); // Show message for 3 seconds
      }, 600); // Small delay to let answer display briefly
    } else {
      // No message, just move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
      } else {
        handleSubmit();
      }
    }, 800);
    }
  };

  // Submit answers and calculate score
  const handleSubmit = () => {
    const numericAnswers = Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [Number(k), Number(v) as 0 | 1 | 2 | 3])
    ) as Phq9Answers;
    const result = computePhq9Score(numericAnswers);
    setScore(result);
    const days = calculateRecoveryDays(result.total);
    setRecoveryDays(days);
    // Move to name/phone collection step instead of results
    setNamePhoneStep("name"); // Reset to name step
    setStep("name-phone");
  };


  // Load Razorpay script once on mount (like BookingDialog)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch available slots for next 7 days (when results step loads)
  useEffect(() => {
    if (step === "results") {
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
          const daysWithAvailableSlots = results.filter((day) => {
            const hasAvailableSlot = day.slots.some((slot: TimeSlot) => !slot.booked);
            return day.slots.length > 0 && hasAvailableSlot;
          });
          setDaysWithSlots(daysWithAvailableSlots);

          // Auto-select earliest available (non-booked) slot for tomorrow
          const tomorrowResult = results.find((r) => isSameDay(r.date, tomorrow));
          if (tomorrowResult && tomorrowResult.slots.length > 0) {
            const firstAvailableSlot = tomorrowResult.slots.find((s: TimeSlot) => !s.booked) || tomorrowResult.slots[0];
            setSelectedDate(tomorrowResult.date);
            setSelectedSlot(firstAvailableSlot);
          } else if (daysWithAvailableSlots.length > 0) {
            const firstDay = daysWithAvailableSlots[0];
            const firstAvailableSlot = firstDay.slots.find((s: TimeSlot) => !s.booked) || firstDay.slots[0];
            setSelectedDate(firstDay.date);
            setSelectedSlot(firstAvailableSlot);
          }
        } catch (error) {
          console.error("Error fetching slots:", error);
        } finally {
          setIsLoadingSlots(false);
        }
      };

      fetchAllSlots();
    }
  }, [step]);

  // Fix hydration error - only run on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer - only run on client
  useEffect(() => {
    if (!mounted) return;
    if (step === "results") {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1 };
          } else if (prev.hours > 0) {
            return { ...prev, hours: prev.hours - 1, minutes: 59 };
          } else if (prev.days > 0) {
            return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
          }
          return prev;
        });
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [step, mounted]);

  // Pre-fill user data if logged in (for results step)
  useEffect(() => {
    if (user && step === "results") {
      if (!name && user.name) {
      setName(user.name || "");
      }
      if (!phone && user.phone) {
        setPhone(user.phone.startsWith("+") ? user.phone : `+${user.phone}`);
      }
      if (user._id && !isVerified) {
        setIsVerified(true);
      }
    }
  }, [user, step, name, phone, isVerified]);

  // Note: OTP is sent manually via Next button, not auto-sent

  // OTP handlers
  const handleSendOtp = async () => {
    if (!phone || !name) {
      toast.error("Please fill in your name and phone number.");
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
        // Move to OTP verification step
        setStep("otp-verify");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/verify-otp`,
        {
          phone: phone.replace("+", ""),
          name,
          otp,
          // No email parameter
        }
      );
      
      if (response.data.r === "s") {
        toast.success("Phone verified successfully!");
        const { user: verifiedUser, token } = response.data.data;

        // Store user data and token in session storage
        sessionStorage.setItem("user", JSON.stringify(verifiedUser));
        sessionStorage.setItem("name", verifiedUser.name);
        sessionStorage.setItem("id", verifiedUser._id);
        sessionStorage.setItem("token", token);

        // IMPORTANT: Update Redux state
        dispatch(
          setUser({
            user: verifiedUser,
            token,
          })
        );

        setIsVerified(true);
        setOtp("");
        setOtpSent(false);

        // Save to Google Sheets
        if (score && recoveryDays !== null) {
          try {
            await saveToGoogleSheets({
              name,
              phone,
              answers,
              score: score.total,
              level: score.level,
              recoveryDays,
              userId: verifiedUser._id,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error("Error saving to Google Sheets:", error);
            // Don't block the flow if this fails
          }
        }

        // Send WhatsApp template and email notifications
        try {
          if (score && recoveryDays !== null) {
            await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/notification/wellness-check-notifications`,
              {
                phone: phone.replace("+", ""),
                name,
                email,
                score: score.total,
                severity: score.level,
                recoveryDays,
              }
            );
          }
        } catch (error) {
          console.error("Error sending notifications:", error);
          // Don't block the flow if this fails
        }

        // Move to results step
        setIsLoadingResults(true);
        setTimeout(() => {
          setIsLoadingResults(false);
          setStep("results");
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  };


  // Handle booking
  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    // Prevent booking of "booked" slots (frontend-only check)
    if (selectedSlot.booked) {
      toast.error("This slot is already booked. Please select another time.");
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

      // Format date as string for backend
      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/payment/create-simple-order`,
        {
          offering_id: CLARITY_CALL_OFFERING._id,
          user_id: bookingUserId,
          date: formattedDate,
          slot: selectedSlot,
          startTime,
          email: email || undefined,
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

  // Helper functions for results page
  const getSymptomDescription = () => {
    if (!score) return "";
    if (score.total <= 4) return "Minimal mood disturbance - occasional low feelings";
    if (score.total <= 9) return "Mild symptoms - some days feel harder than others";
    if (score.total <= 14) return "Moderate symptoms - daily struggle with energy and motivation";
    if (score.total <= 19) return "Moderately severe symptoms - significant impact on daily life";
    return "Severe symptoms - overwhelming feelings affecting all areas of life";
  };

  const getCoachDisplayName = (name: string) => {
    if (name.toLowerCase().includes("anahata") || name.toLowerCase().includes("annie")) {
      return "Annie";
    }
    const cleanedName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
    const parts = cleanedName.split(" ").filter((word) => !["therapy", "with", "coach", "by"].includes(word.toLowerCase()));
    return parts.length > 0 ? parts[0] : "Expert";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navigateToClarityCall = () => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (phone) params.set("phone", phone);
    if (email) params.set("email", email);
    router.push(`/clarity-call?${params.toString()}`);
  };


  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "hh:mm a");
  };

  const formatDateShort = (date: Date) => {
    return format(date, "EEE d MMM");
  };

  const formatDateDay = (date: Date) => {
    return format(date, "EEE");
  };

  const formatDateNumber = (date: Date) => {
    return format(date, "d");
  };

  const formatDateMonth = (date: Date) => {
    return format(date, "MMM");
  };

  const getTimeOfDay = (hour: number) => {
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  // Process slots: show slots at specific hours (12, 1, 4, 5, 6, 7 PM), mark 2-3 as available
  const processSlotsForDisplay = (slots: TimeSlot[], date: Date): TimeSlot[] => {
    // Filter slots to only show at specific hours: 12 PM, 1 PM, 4 PM, 5 PM, 6 PM, 7 PM
    const targetHours = [12, 13, 16, 17, 18, 19]; // 12 PM, 1 PM, 4 PM, 5 PM, 6 PM, 7 PM
    
    const filteredSlots = slots.filter((slot: TimeSlot) => {
      const slotDate = new Date(slot.start);
      const hour = slotDate.getHours();
      const minute = slotDate.getMinutes();
      // Match slots that start at these hours (within first 30 minutes to allow for slight variations)
      return targetHours.includes(hour) && minute < 30;
    });

    // Sort by time
    filteredSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Use date as seed for consistent randomness per day
    const dateSeed = date.getTime();
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Group slots by hour to ensure we have slots for each target hour
    const slotsByHour = new Map<number, TimeSlot[]>();
    filteredSlots.forEach((slot) => {
      const hour = new Date(slot.start).getHours();
      if (!slotsByHour.has(hour)) {
        slotsByHour.set(hour, []);
      }
      slotsByHour.get(hour)!.push(slot);
    });

    // Select one slot per target hour (if available)
    const selectedSlots: TimeSlot[] = [];
    targetHours.forEach((hour) => {
      const hourSlots = slotsByHour.get(hour) || [];
      if (hourSlots.length > 0) {
        // Randomly pick one slot from this hour
        const randomIndex = Math.floor(random(dateSeed + hour) * hourSlots.length);
        selectedSlots.push(hourSlots[randomIndex]);
      }
    });

    // Sort selected slots by time
    selectedSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Randomly decide how many slots should be available (2-3), rest will be booked
    const availableCount = selectedSlots.length >= 3
      ? Math.floor(random(dateSeed * 2) * 2) + 2 // 2 or 3 available
      : selectedSlots.length; // If less than 3, all available

    // Randomly select which slots are available (not booked)
    const availableIndices = new Set<number>();
    const allIndices = [...Array(selectedSlots.length).keys()];
    
    for (let i = 0; i < availableCount && allIndices.length > 0; i++) {
      const randomIndex = Math.floor(random(dateSeed * 3 + i) * allIndices.length);
      const selectedIndex = allIndices.splice(randomIndex, 1)[0];
      availableIndices.add(selectedIndex);
    }

    return selectedSlots.map((slot, index) => ({
      ...slot,
      booked: !availableIndices.has(index), // Mark as booked if not in available set
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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Cover Page
  if (step === "cover") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center space-y-6 sm:space-y-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Check how you&apos;ve really been doing lately.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed px-2">
            A quick 2-minute self-check to understand your current stress level and what might help you feel better.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">⭐</span>
              <span className="font-medium text-sm sm:text-base">Trusted by 1000+ people</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">💬</span>
              <span className="font-medium text-sm sm:text-base">Backed by real coaching experience</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">⏱️</span>
              <span className="font-medium text-sm sm:text-base">Takes under 2 minutes</span>
            </div>
          </div>

          <Button
            onClick={() => setStep("questions")}
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 font-semibold w-full sm:w-auto"
          >
            Start My 2 Min Self-Check
          </Button>
          <p className="text-xs sm:text-sm text-gray-500">
            • Private & secure
          </p>
        </motion.div>
      </div>
    );
  }

  // Questions Page (Chatbot)
  if (step === "questions") {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto">
          {/* Instruction Text */}
          <div className="mb-4">
            <p className="text-sm sm:text-base text-gray-600 italic">
              Over the last 2 weeks, how often have you been bothered by the following problems?
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Completion: {Math.round(progress)}%</div>
              <div className="text-sm text-gray-600 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-gray-200">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="space-y-4 min-h-[300px] sm:min-h-[400px] flex flex-col">
            {/* Bot Message */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 sm:gap-3"
            >
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4 shadow-sm max-w-[90%] sm:max-w-[80%]">
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed font-normal">{currentQuestion.text}</p>
              </div>
            </motion.div>

            {/* User Response Options - Hide when showing nurturing message */}
            <AnimatePresence>
              {answers[currentQuestion.id] && !currentNurturingMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-end"
                >
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 sm:py-4 max-w-[90%] sm:max-w-[80%]">
                    <p className="text-sm sm:text-base leading-relaxed font-normal">{PHQ9.response_scale[Number(answers[currentQuestion.id])]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lead nurturing message - Centered, not chatbot style */}
            {currentNurturingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8 sm:py-12"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-6 sm:px-8 py-5 sm:py-6 max-w-2xl shadow-md">
                  <p className="text-center text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                    {currentNurturingMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Answer Options */}
            {!answers[currentQuestion.id] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 sm:space-y-3 mt-4"
              >
                {[0, 1, 2, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(String(value))}
                    className="w-full text-left bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 px-4 sm:px-5 py-3 sm:py-4 transition-all text-sm sm:text-base leading-relaxed font-normal break-words"
                  >
                    {PHQ9.response_scale[value]}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Name & Phone Collection Step
  if (step === "name-phone") {
    const handleNameNext = () => {
      if (name.trim()) {
        setNamePhoneStep("phone");
      } else {
        toast.error("Please enter your name");
      }
    };

    const handleNameKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleNameNext();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto space-y-6">
                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Almost there!</h2>
            <p className="text-base sm:text-lg text-gray-600">We just need a few details to show you your personalized results</p>
                </motion.div>

                <motion.div
            key={namePhoneStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6"
          >
            {namePhoneStep === "name" ? (
              <>
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-base font-semibold">What&apos;s your name?</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleNameKeyPress}
                    className="w-full text-base py-6"
                    type="text"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  </div>
                <Button
                  onClick={handleNameNext}
                  disabled={!name.trim()}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
                >
                  Next
                </Button>
                <p className="text-xs text-gray-500 text-center">Press Enter or click Next</p>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      What&apos;s your email address? <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      What&apos;s your phone number? <span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={phone}
                      onChange={(value) => setPhone(value || "")}
                      className="flex-1"
                      required
                      placeholder="Enter your phone number"
                      autoFocus
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Please enter the number with WhatsApp
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!phone) {
                      toast.error("Please enter your phone number");
                      return;
                    }
                    // Phone validation will trigger auto-send OTP
                    const phoneDigits = phone.replace(/\D/g, "");
                    if (phoneDigits.length >= 10) {
                      handleSendOtp();
                    } else {
                      toast.error("Please enter a valid phone number");
                    }
                  }}
                  disabled={!phone || otpSent}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
                >
                  {otpSent ? "OTP Sent ✓" : "Next"}
                </Button>
                {otpSent && (
              <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-blue-900 font-medium">
                      ✓ OTP sent to your phone. Please check the OTP verification step.
                </p>
              </motion.div>
            )}
              </>
            )}
          </motion.div>
          </div>
      </div>
    );
  }

  // OTP Verification Step
  if (step === "otp-verify") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        {isLoadingResults && <Loader />}
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Verify Your Phone</h2>
            <p className="text-base sm:text-lg text-gray-600">We sent a 6-digit code to {phone}</p>
            <p className="text-sm sm:text-base text-blue-600 font-medium">📱 Check your WhatsApp for OTP</p>
                </motion.div>

                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6"
          >
            <div className="space-y-4">
              <Label htmlFor="otp" className="text-base font-semibold">
                Enter OTP <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                    className="flex-1 text-center text-xl sm:text-2xl tracking-widest"
                  maxLength={6}
                />
                      </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
                size="lg"
              >
                {isVerifying ? "Verifying..." : isLoadingResults ? "Loading your results..." : "Verify & Continue"}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={handleSendOtp}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Resend OTP
                </button>
              </p>
                </div>
                </motion.div>
              </div>
      </div>
    );
  }

  // Results Page (Prototype-2 Design)
  if (step === "results" && score && recoveryDays !== null) {
    // Get grouped slots for selected date
    const groupedSlots = selectedDate ? groupSlotsByTimeOfDay(
      daysWithSlots.find((d) => isSameDay(d.date, selectedDate))?.slots || []
    ) : null;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Urgency Bar under Nav */}
        <motion.div
          className="fixed top-16 left-0 right-0 z-40 bg-blue-600 text-white text-center py-2 sm:py-2.5 flex items-center justify-center gap-2 shadow-md"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
          <p className="text-xs sm:text-sm md:text-base font-semibold animate-pulse">
            Hurry! We are running out...fast!
            <br className="sm:hidden" />
            Only {timeLeft.days} days left at this price!
          </p>
        </motion.div>


        {/* SCREEN 1: Score + Recovery Timeline */}
        <section className="pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 bg-gradient-to-b from-white via-blue-50 to-white">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3 sm:space-y-4"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Your Assessment Results</h1>
              <div className="space-y-3">
                  <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 break-words">
                    <span style={{ color: primary }}>{score.total}</span>{" "}
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600">/ 27</span>
                      </div>
                  <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 text-orange-700 rounded-full text-sm sm:text-lg font-semibold">
                    {score.level}
                    </div>
                    </div>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium px-2 break-words">{getSymptomDescription()}</p>
                  </div>
            </motion.div>

            {/* Recovery Timeline Comparison */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-blue-200"
              >
                <div className="text-center space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 break-words">
                    How Long Will It Take You To Feel Better?
                </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-red-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-red-200">
                      <div className="text-lg sm:text-xl md:text-2xl text-gray-500 line-through mb-2">Usually takes 6 months</div>
                      <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto" />
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">Traditional therapy & self-help</p>
                        </div>
                    <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 break-words" style={{ color: primary }}>
                        <span className="block sm:inline">GuildUp: </span><span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{recoveryDays}</span> <span className="text-base sm:text-lg md:text-xl lg:text-2xl">days</span>
                        </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Based on your score</p>
                      <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto" />
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">Our proven framework</p>
                  </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">
                      Most people at your stage start feeling{" "}
                      <span style={{ color: primary }}>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold">50–70%</span> better in the first{" "}
                        <span className="text-lg sm:text-xl md:text-2xl font-bold">30 days</span>
                      </span>
                    </p>
                  </div>
                  {/* CTA Button */}
                  <div className="pt-2 sm:pt-4">
                  <Button
                    size="lg"
                      onClick={navigateToClarityCall}
                      className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
                  >
                    Book Your Clarity Call Now
                  </Button>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Get your personalized recovery roadmap</p>
                  </div>
              </div>
            </motion.div>
        </div>
        </section>

        {/* SCREEN 2: The Problem - Your Symptoms */}
        <section className="py-8 sm:py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 text-center break-words px-2">
                What Your Score of{" "}
                <span style={{ color: primary }}>{score.total}</span>/27 Really Means
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center px-2 break-words">
                You&apos;re experiencing{" "}
                <span className="font-bold" style={{ color: primary }}>{score.level.toLowerCase()}</span> that are impacting your daily life
              </p>
              
              <div className="bg-red-50 rounded-xl p-4 sm:p-6 border-l-4 border-red-600 space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">You&apos;re likely experiencing:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    "Feeling down, depressed, or hopeless",
                    "Little interest or pleasure in doing things",
                    "Trouble falling or staying asleep",
                    "Feeling tired or having little energy",
                    "Poor appetite or overeating",
                    "Feeling bad about yourself",
                    "Trouble concentrating",
                    "Moving slowly or being restless",
                  ].map((symptom, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base break-words">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">You&apos;ve probably tried:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    "Therapy - talks but doesn't change how your body reacts",
                    "Pills - numb feelings but don't fix the root cause",
                    "Meditation - temporary peace until the next spiral",
                    "Self-help books - motivation that never lasts",
                    "Breathing exercises - that only make your heart pound faster",
                    "Gratitude journals - even when your mind won't stop racing",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm sm:text-base break-words">{item}</span>
                      </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 rounded-lg p-4 sm:p-6" style={{ borderColor: primary }}>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 break-words">
                  The Truth:{" "}
                  <span style={{ color: primary }}>
                    Anxiety, depression, and toxic relationship loops aren&apos;t thought problems. They&apos;re nervous system problems.
                        </span>
                </p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mt-2 sm:mt-3 break-words">
                  Your mind and nervous system have been stuck in survival mode — reacting like you&apos;re under threat even when you&apos;re safe.
                </p>
                      </div>

              {/* CTA Button */}
              <div className="text-center pt-6 sm:pt-8">
                <Button
                  size="lg"
                  onClick={navigateToClarityCall}
                  className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
                >
                  Book Your Clarity Call Now
                </Button>
                <p className="text-sm sm:text-base text-gray-600 mt-3">Get your personalized recovery roadmap</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SCREEN 3: The GuildUp Framework */}
        <section className="py-8 sm:py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-4 sm:space-y-6"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 px-2 break-words">
                How <span style={{ color: primary }}>GuildUp</span> Framework Fixes This in{" "}
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl break-words" style={{ color: primary }}>
                  {recoveryDays} Days
                      </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 px-2">
                Not by managing symptoms, but by <span className="font-bold text-blue-600">resetting your nervous system from the root</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                {[
                  {
                    step: "1",
                    title: "Deep Mind Assessment",
                    desc: "Complete mapping of your inner system — how your emotions, thoughts, and nervous-system responses interact",
                    benefit: "Releases 80% of mental tension within 7 days",
                  },
                  {
                    step: "2",
                    title: "Nervous System Reset",
                    desc: "Identify how your body traps tension and learn 2-5 minute root-cause-based neuro techniques",
                    benefit: "Shift from fight-or-flight to calm, balanced state",
                  },
                  {
                    step: "3",
                    title: "Cognitive Reframing",
                    desc: "Spot the thought patterns that keep you anxious and learn to catch a spiral the moment it starts",
                    benefit: "Train your mind to stay clear, grounded, and calm",
                  },
                  {
                    step: "4",
                    title: "Emotional Release",
                    desc: "Understand what sparks your emotions and why they build up — learn to release instead of bottling",
                    benefit: "Release what you feel instead of storing it",
                  },
                  {
                    step: "5",
                    title: "Personalized Roadmap",
                    desc: "Clear, personalized action plan built around how you think, feel, and live",
                    benefit: "Real changes fast — better focus, steadier emotions, deeper sleep",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl mb-3 sm:mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">{item.desc}</p>
                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
                      <p className="text-xs sm:text-sm font-semibold text-green-700">{item.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-blue-200 mt-6 sm:mt-8">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  More than <span className="text-2xl sm:text-3xl md:text-4xl" style={{ color: primary }}>2,500</span> people have followed this same process
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-700">
                  To move from anxiety, depression, and relationship stress to confidence, clarity, and lasting peace — often within just 3 weeks.
                      </p>
                </div>

              {/* CTA Button */}
              <div className="text-center pt-6 sm:pt-8">
                <Button
                  size="lg"
                  onClick={navigateToClarityCall}
                  className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
                >
                  Book Your Clarity Call Now
                </Button>
                <p className="text-sm sm:text-base text-gray-600 mt-3">Start your transformation today</p>
              </div>
            </motion.div>
                </div>
        </section>

        {/* SCREEN 4: This Is For You If... */}
        <section className="py-8 sm:py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-green-200">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  ✅ This is for you if…
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "You're tired of feeling anxious, depressed, or stuck in the same relationship patterns",
                    "You've tried therapy, pills, meditation, or self-help but nothing lasted",
                    "You wake up tired, anxious, and emotionally on edge — even after 'doing everything right'",
                    "You overthink every small thing and feel low for no reason",
                    "You want to understand WHY you feel this way, not just manage symptoms",
                    "You're ready to reset your nervous system and feel safe, stable, and connected again",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm sm:text-base md:text-lg text-gray-700">{item}</p>
                              </div>
                  ))}
                              </div>
                              </div>

              <div className="bg-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-red-200">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  ❌ This is not for you if:
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "You're looking for a quick fix or magic pill",
                    "You're not ready to take action or commit to consistent habits",
                    "You expect results without guidance, accountability, and patience",
                    "You want to keep managing symptoms instead of fixing the root cause",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm sm:text-base md:text-lg text-gray-700">{item}</p>
                                </div>
                  ))}
                  </div>
              </div>

              {/* CTA Button */}
              <div className="text-center pt-6 sm:pt-8">
                <Button
                  size="lg"
                  onClick={navigateToClarityCall}
                  className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
                >
                  Book Your Clarity Call Now
                </Button>
                <p className="text-sm sm:text-base text-gray-600 mt-3">Ready to transform your life?</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SCREEN 5: After This Call You Will Know... */}
        <section className="py-8 sm:py-12 px-4 bg-gradient-to-b from-indigo-50 to-blue-50">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-indigo-200"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center px-2">
                After This Exclusive{" "}
                <span style={{ color: primary }}>1-on-1</span> Call You Will Know:
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  "You will exactly know why you have not been able to get out of Anxiety",
                  "You will get a detailed game plan from us about what to do next",
                  "How to start seeing changes in just 1 week from this call",
                  "How to improve your relationships with your loved ones",
                  "How to achieve your full potential capacity at your work",
                  "How to attain a relaxed state in your day to day life",
                  "A game plan to finally throw your medicines into the bin forever",
                ].map((item, idx) => {
                  const parts = item.split(/(\d+\+?)/);
                  return (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium leading-relaxed">
                        {parts.map((part, i) => 
                          /^\d+\+?$/.test(part) ? (
                            <span key={i} style={{ color: primary, fontWeight: 700 }}>{part}</span>
                          ) : (
                            part
                          )
                        )}
                  </p>
                </div>
                          );
                        })}
                      </div>

              {/* CTA Button */}
              <div className="text-center pt-6 sm:pt-8">
                <Button
                  size="lg"
                  onClick={navigateToClarityCall}
                  className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
                >
                  Book Your Clarity Call Now
                </Button>
                <p className="text-sm sm:text-base text-gray-600 mt-3">Get all this in just one call</p>
              </div>
            </motion.div>
        </div>
        </section>

        {/* SCREEN 6: Coaches + Testimonials */}
        <section className="py-8 sm:py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
            {/* Coaches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Our Top Coaches</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">Expert guidance from India&apos;s most trusted mental health professionals</p>
              {loadingCommunities ? (
                <div className="text-center py-8">Loading coaches...</div>
              ) : coaches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  {coaches.map((coach: any, idx: number) => {
                    const communityDetails = coach?.community || coach;
                    let name = communityDetails?.name || "Expert";
                    const firstName = getCoachDisplayName(name);
                    const avatar = 
                      communityDetails?.avatar_url || 
                      communityDetails?.profile_image || 
                      communityDetails?.avatar ||
                      communityDetails?.image ||
                      communityDetails?.profile_picture ||
                      "";
    return (
                      <div key={idx} className="text-center">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden mb-4 bg-gray-100 border-4 shadow-lg" style={{ borderColor: primary }}>
                          {avatar ? (
                            <img 
                              src={avatar} 
                              alt={name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl md:text-6xl font-bold" style="background-color: ${primary}">${name.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl md:text-6xl font-bold" style={{ backgroundColor: primary }}>
                              {name.charAt(0).toUpperCase()}
                    </div>
                          )}
                  </div>
                        <h3 className="font-semibold text-lg sm:text-xl text-gray-900">
                          Coach {firstName}
                        </h3>
                          </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No coaches available</div>
              )}
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Hear From Real People</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: primary }}>2,500+</span> People Have Reset Their Mind & Nervous System
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {testimonials.map((testimonial, idx) => {
                  const initials = getInitials(testimonial.author);
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {initials}
                              </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                            {testimonial.verified && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">✓</span>
                            )}
                              </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill="#FBBF24" stroke="#FBBF24" />
                            ))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {testimonial.location} • {testimonial.date}
                        </div>
                          </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    </div>
                          );
                        })}
                      </div>

            {/* CTA Button */}
            <div className="text-center pt-6 sm:pt-8">
              <Button
                size="lg"
                onClick={navigateToClarityCall}
                className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all break-words"
              >
                Book Your Clarity Call Now
              </Button>
              <p className="text-sm sm:text-base text-gray-600 mt-3">Join 2,500+ people who transformed their lives</p>
            </div>
            </motion.div>
          </div>
        </section>

        {/* SCREEN 7: Refund Guarantee */}
        <section className="py-8 sm:py-12 px-4 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border-2 border-green-200"
            >
              <div className="text-center space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 px-2">
                  If you don&apos;t find the call valuable you can get a{" "}
                  <span className="text-blue-600 underline">100% Refund</span> within the call itself!
                </h2>
                <div className="flex justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-yellow-600">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">100%</div>
                      <div className="text-xs sm:text-sm font-semibold">MONEY BACK</div>
                          </div>
                        </div>
                    </div>
                  </div>

              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Here&apos;s how it works!</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                        <span className="underline text-blue-600">Book your call:</span> Schedule a consultation with our ANXIETY expert who is well-equipped to provide a game plan.
                      </p>
                          </div>
                          </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                        <span className="underline text-blue-600">Find value or get a refund:</span> During your consultation, if at any point you feel you&apos;re not receiving valuable insights, strategies, or advice, let our expert know immediately. We respect your time and your journey, and if you&apos;re not finding the call helpful, we will immediately initiate the refund process for the full amount of the consultation.
                      </p>
                        </div>
                    </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        <span className="underline text-red-600">The amount will be non-refundable</span> only in the case of you don&apos;t show up.
                      </p>
                </div>
            </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SCREEN 8: Booking Section with Pricing */}
        <section className="py-8 sm:py-12 px-4 bg-white pb-24 sm:pb-12">
          <div className="max-w-2xl mx-auto w-full space-y-6 sm:space-y-8">
            {/* Pricing Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                Book Your <span style={{ color: primary }}>40-Min</span> Clarity Call
              </h2>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Name</Label>
                  <Input value={name} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Phone</Label>
                  <Input value={phone} disabled className="bg-gray-50" />
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Email</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white"
                  />
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
                                  // Select first available (non-booked) slot
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
                  disabled={!selectedDate || !selectedSlot || isProcessing || selectedSlot?.booked}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold py-4 sm:py-5 md:py-6 lg:py-7 disabled:opacity-50 disabled:cursor-not-allowed break-words"
                >
                  {isProcessing ? "Processing..." : selectedSlot?.booked ? "Slot Booked" : "Book My Clarity Call"}
                </Button>
                <p className="text-xs sm:text-sm text-center text-gray-600">
                  Secure payment • Instant confirmation • 100% refund if not valuable
                </p>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    );
  }

  return null;
}
