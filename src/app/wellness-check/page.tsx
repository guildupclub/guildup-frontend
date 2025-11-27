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
import { Clock, CheckCircle2, Sparkles, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sun, Sunset } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = "cover" | "questions" | "results" | "booking";

interface TimeSlot {
  start: string;
  end: string;
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
  const [scrollPosition, setScrollPosition] = useState(0);

  const questions = useMemo(() => PHQ9.questions.map((q) => ({ id: String(q.id), text: q.text })), []);

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

    // Show micro-affirmation
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
      } else {
        handleSubmit();
      }
    }, 800);
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
    setStep("results");
    setIsAnimating(true);

    // Animate through results
    setTimeout(() => setIsAnimating(false), 3000);
  };

  // Fetch available slots for next 7 days
  useEffect(() => {
    if (step === "booking") {
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
                  console.log(`Slots for ${formattedDate}:`, res.data);
                  const filteredSlots = (res.data || []).filter((slot: TimeSlot) => {
                    const startHour = new Date(slot.start).getHours();
                    return startHour >= 11 && startHour < 20; // 11 AM to 8 PM
                  });
                  return { date, slots: filteredSlots };
                })
                .catch((error) => {
                  console.error(`Error fetching slots for ${formattedDate}:`, error);
                  console.error("Error details:", error.response?.data || error.message);
                  return { date, slots: [] };
                })
            );
          }

          const results = await Promise.all(slotsPromises);
          const daysWithAvailableSlots = results.filter((day) => day.slots.length > 0);
          setDaysWithSlots(daysWithAvailableSlots);

          // Auto-select earliest slot for tomorrow
          const tomorrowResult = results.find((r) => isSameDay(r.date, tomorrow));
          if (tomorrowResult && tomorrowResult.slots.length > 0) {
            setSelectedDate(tomorrowResult.date);
            setSelectedSlot(tomorrowResult.slots[0]);
          } else if (daysWithAvailableSlots.length > 0) {
            // Select first available day
            setSelectedDate(daysWithAvailableSlots[0].date);
            setSelectedSlot(daysWithAvailableSlots[0].slots[0]);
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

  // Fix hydration error - only run on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer - only run on client
  useEffect(() => {
    if (!mounted) return;
    if (step === "results" || step === "booking") {
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

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && step === "booking") {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.phone) {
        setPhone(user.phone.startsWith("+") ? user.phone : `+${user.phone}`);
      }
      if (user._id) {
        setIsVerified(true);
      }
    }
  }, [user, step]);

  // OTP handlers
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
    setIsVerifying(true);
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
        toast.success("Phone verified successfully!");
        const { user: verifiedUser, token } = response.data.data;

        // Store user data and token in session storage
        sessionStorage.setItem("user", JSON.stringify(verifiedUser));
        sessionStorage.setItem("name", verifiedUser.name);
        sessionStorage.setItem("id", verifiedUser._id);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("email", verifiedUser.email);

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

      console.log("Creating order with:", {
        offering_id: CLARITY_CALL_OFFERING._id,
        user_id: bookingUserId,
        date: formattedDate,
        slot: selectedSlot,
        startTime,
      });

      if (!bookingUserId) {
        toast.error("User ID is missing. Please log in again.");
        setIsProcessing(false);
        return;
      }

      if (!CLARITY_CALL_OFFERING._id) {
        toast.error("Offering ID is missing.");
        setIsProcessing(false);
        return;
      }

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
            email: (user?.email || email || "").trim(),
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
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage = error.response?.data?.message || error.response?.data?.e || error.message || "Failed to process booking";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
            Feel better in 30 days.
            <br />
            Not 6 months.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed px-2">
            Find out your stress stage and how many days it will take for you to feel better.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">⭐</span>
              <span className="font-medium text-sm sm:text-base">500+ people supported</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">💬</span>
              <span className="font-medium text-sm sm:text-base">1:1 coaching + WhatsApp support daily</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl sm:text-2xl">⏱</span>
              <span className="font-medium text-sm sm:text-base">Takes under 2 minutes</span>
            </div>
          </div>

          <Button
            onClick={() => setStep("questions")}
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 font-semibold w-full sm:w-auto"
          >
            Start My 2-Minute Check
          </Button>
        </motion.div>
      </div>
    );
  }

  // Questions Page (Chatbot)
  if (step === "questions") {
    const currentQuestion = questions[currentQuestionIndex];
    const affirmationMessages = [
      "Got it",
      "Totally normal to feel this.",
      "You're doing great — few more left.",
      "Thanks for sharing that.",
      "I understand.",
      "That's helpful.",
    ];
    const affirmationIndex = currentQuestionIndex % affirmationMessages.length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto">
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

            {/* User Response Options */}
            <AnimatePresence>
              {answers[currentQuestion.id] && (
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

            {/* Micro-affirmation */}
            {answers[currentQuestion.id] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 sm:gap-3"
              >
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2 sm:py-3">
                  <p className="text-xs sm:text-sm text-gray-600 font-normal">{affirmationMessages[affirmationIndex]}</p>
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
                    className="w-full text-left bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 px-4 sm:px-5 py-3 sm:py-4 transition-all text-sm sm:text-base leading-relaxed font-normal"
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

  // Results Page
  if (step === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Animation Sequence */}
          <div className="text-center space-y-6">
            {isAnimating ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-base font-normal">Analysing your patterns…</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-base font-normal">Finding your emotional load…</p>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Your recovery timeline → {recoveryDays} days
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Most people at your stage start feeling 50–70% better in the first 30 days.
                </p>
              </motion.div>
            )}
          </div>

          {!isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* 4 Pillars */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">How we help you:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base leading-relaxed font-normal">1:1 coaching to process triggers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base leading-relaxed font-normal">Daily 5-minute micro practices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base leading-relaxed font-normal">EFT + grounding for instant relief</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base leading-relaxed font-normal">Daily WhatsApp accountability</span>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">You&apos;ll experience:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Better sleep", "Less spiraling", "Reduced overthinking", "More emotional stability"].map(
                    (benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-normal">{benefit}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Enhanced CTA */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border-2 border-blue-200 shadow-lg">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Unlock Your 30-Day Calm Plan</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl line-through text-gray-400 flex items-center gap-1">
                          <FaRupeeSign className="w-5 h-5" />
                          1,999
                        </span>
                        <span className="text-3xl sm:text-4xl font-bold text-blue-600 flex items-center gap-1">
                          <FaRupeeSign className="w-6 h-6 sm:w-7 sm:h-7" />
                          299
                        </span>
                      </div>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Save 85%
                      </span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm sm:text-base text-red-700 font-semibold">
                        ⏰ Limited Time: Only {timeLeft.days} days left at this price!
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 text-left">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3">What you get:</h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-sm sm:text-base text-gray-900">40-minute Clarity Call</span>
                          <p className="text-xs sm:text-sm text-gray-600">Deep dive into your stress patterns and root causes</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-sm sm:text-base text-gray-900">Personal Recovery Roadmap</span>
                          <p className="text-xs sm:text-sm text-gray-600">Customized plan based on your assessment results</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-sm sm:text-base text-gray-900">30-Day Support Access</span>
                          <p className="text-xs sm:text-sm text-gray-600">Daily WhatsApp check-ins and guidance</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-sm sm:text-base text-gray-900">Instant Relief Techniques</span>
                          <p className="text-xs sm:text-sm text-gray-600">EFT, grounding, and breathing exercises you can use immediately</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setStep("booking")}
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 font-semibold w-full"
                  >
                    Book Your Clarity Call Now
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-600 font-normal">
                    Secure payment · Instant confirmation · Reschedule anytime
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Booking Page
  if (step === "booking") {
    const handleDateClick = (day: DaySlots) => {
      setSelectedDate(day.date);
      if (day.slots.length > 0) {
        setSelectedSlot(day.slots[0]);
      }
    };

    const getSlotsForSelectedDate = () => {
      if (!selectedDate) return [];
      const dayData = daysWithSlots.find((d) => isSameDay(d.date, selectedDate));
      return dayData?.slots || [];
    };

    const isTomorrow = (date: Date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return isSameDay(date, tomorrow);
    };

    const scrollDates = (direction: "left" | "right") => {
      const container = document.getElementById("dates-container");
      if (container) {
        const scrollAmount = 200;
        const newPosition = direction === "left" 
          ? scrollPosition - scrollAmount 
          : scrollPosition + scrollAmount;
        container.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
      }
    };

    const groupedSlots = selectedDate ? groupSlotsByTimeOfDay(getSlotsForSelectedDate()) : null;

    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Panel - Date and Time Selection */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Date and Time</h2>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="ml-3 text-gray-600">Loading available slots...</p>
                </div>
              ) : daysWithSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="mb-2">No available slots in the next 7 days.</p>
                  <p className="text-sm text-gray-500">Please check back later or contact support.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Date Selection - Horizontal Scrollable */}
                  <div>
                    <div className="relative">
                      <button
                        onClick={() => scrollDates("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:bg-gray-50"
                        disabled={scrollPosition <= 0}
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <div
                        id="dates-container"
                        className="flex gap-3 overflow-x-auto pb-2 px-8 scrollbar-hide"
                        style={{ 
                          scrollbarWidth: "none",
                          msOverflowStyle: "none"
                        }}
                      >
                        {daysWithSlots.map((day, index) => {
                          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                          const isRecommended = isTomorrow(day.date);

                          return (
                            <button
                              key={index}
                              onClick={() => handleDateClick(day)}
                              className={`flex-shrink-0 w-24 sm:w-28 text-center p-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? "border-green-600 bg-green-50"
                                  : day.slots.length === 0
                                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                              }`}
                              disabled={day.slots.length === 0}
                            >
                              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">
                                {formatDateDay(day.date)}
                              </div>
                              <div className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                                {formatDateNumber(day.date)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDateMonth(day.date)}
                              </div>
                              {day.slots.length > 0 ? (
                                <div className="text-xs text-gray-600 mt-2">
                                  {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 mt-2">no slots</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => scrollDates("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Time Selection - Grouped by Time of Day */}
                  {selectedDate && groupedSlots && (
                    <div className="space-y-4">
                      {groupedSlots.morning.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <h3 className="font-semibold text-sm text-gray-900">Morning</h3>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.morning.map((slot, slotIndex) => (
                              <button
                                key={slotIndex}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                  selectedSlot?.start === slot.start
                                    ? "border-green-600 bg-green-50 font-semibold"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                {formatTime(slot.start)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {groupedSlots.afternoon.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sun className="w-4 h-4 text-orange-500" />
                            <h3 className="font-semibold text-sm text-gray-900">Afternoon</h3>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.afternoon.map((slot, slotIndex) => (
                              <button
                                key={slotIndex}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                  selectedSlot?.start === slot.start
                                    ? "border-green-600 bg-green-50 font-semibold"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                {formatTime(slot.start)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {groupedSlots.evening.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sunset className="w-4 h-4 text-purple-500" />
                            <h3 className="font-semibold text-sm text-gray-900">Evening</h3>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.evening.map((slot, slotIndex) => (
                              <button
                                key={slotIndex}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                  selectedSlot?.start === slot.start
                                    ? "border-green-600 bg-green-50 font-semibold"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                {formatTime(slot.start)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel - Checkout */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Book Your Clarity Session</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                40-min deep dive · Root cause analysis · Personal roadmap
              </p>

              {/* User Details Form */}
              <div className="space-y-4 mb-4 sm:mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    type="text"
                    placeholder="Enter your name"
                    disabled={isVerified}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isVerified}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={phone}
                      onChange={(value) => setPhone(value || "")}
                      className="flex-1"
                      required
                      placeholder="Enter your phone number"
                      disabled={otpSent || isVerified}
                    />
                    {!otpSent && !isVerified && (
                      <Button
                        onClick={handleSendOtp}
                        disabled={!phone || !name || !email}
                        className="whitespace-nowrap"
                      >
                        Send OTP
                      </Button>
                    )}
                  </div>
                </div>

                {otpSent && !isVerified && (
                  <div className="space-y-2 rounded-lg bg-blue-50 p-4">
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
                        className="bg-blue-600"
                        disabled={isVerifying || otp.length !== 6}
                      >
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Didn&apos;t receive it?{" "}
                      <button
                        onClick={handleSendOtp}
                        className="text-blue-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </p>
                  </div>
                )}

                {isVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">✓ Phone verified successfully</p>
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 border-t pt-4">
                {selectedDate && mounted && (
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Date</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">{format(selectedDate, "PPP")}</span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Time</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">{formatTime(selectedSlot.start)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Duration</span>
                  <span className="font-semibold text-xs sm:text-sm text-gray-900">{CLARITY_CALL_OFFERING.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="font-semibold text-sm sm:text-base text-gray-900">Total</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl line-through text-gray-400 flex items-center gap-1">
                      <FaRupeeSign className="w-4 h-4" />
                      1,999
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-1">
                      <FaRupeeSign className="w-5 h-5" />
                      {CLARITY_CALL_OFFERING.price}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBook}
                disabled={!selectedDate || !selectedSlot || isProcessing || !isVerified}
                size="lg"
                className="w-full text-base sm:text-lg py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 mb-3 sm:mb-4 font-semibold"
              >
                {isProcessing ? "Processing..." : "Book Now"}
              </Button>

              <div className="text-center text-xs sm:text-sm text-gray-600 space-y-1">
                <p className="font-normal">🔒 Secure payment · Instant Google Meet link · Reschedule anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
