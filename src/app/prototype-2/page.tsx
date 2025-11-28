"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Sparkles, Calendar as CalendarIcon, Clock, Star, X, ArrowDown, AlertCircle } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { format, addDays } from "date-fns";
import { useCachedCommunities } from "@/hooks/useCachedCommunities";
import { primary } from "@/app/colours";

// Mock data
const mockScore = 18;
const mockTotal = 27;
const mockLevel = "Moderate symptoms";
const mockRecoveryDays = 49;
const mockName = "John Doe";
const mockPhone = "+91 98765 43210";

const mockTestimonials = [
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
];

const mockSlots = [
  { date: addDays(new Date(), 1), time: "11:00 AM", available: true },
  { date: addDays(new Date(), 1), time: "2:00 PM", available: true },
  { date: addDays(new Date(), 1), time: "4:00 PM", available: true },
  { date: addDays(new Date(), 2), time: "11:00 AM", available: true },
  { date: addDays(new Date(), 2), time: "3:00 PM", available: true },
];

export default function Prototype2Page() {
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 12, minutes: 45 });
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data, loading: loadingCommunities } = useCachedCommunities({});

  // Get stress-anxiety coaches
  const coaches = useMemo(() => {
    if (!data?.communities) return [];
    const allowedIds = [
      "6873fd21bb8cdb102a32e33c", // Annie
      "67e813849e012602676e0504", // Coach Jas
      "6814bb85ca1a0821767ee20b", // Heal with Bhakti
      "68527e2fa05733beb31e6380", // Shreya
      "685bcf2d76aa736a1c6853fe", // Khushi Tayal
      "681ddea3060002ed6eff7b2e", // Divya Mittar
    ];
    return data.communities
      .filter((c: any) => {
        const communityId = (c?.community?._id || c?._id) || "";
        return allowedIds.includes(communityId);
      })
      .slice(0, 3);
  }, [data]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const bookingSection = document.getElementById("booking-section");
      
      // Check if booking section is in view - hide button if it is
      if (bookingSection) {
        const bookingRect = bookingSection.getBoundingClientRect();
        // If booking section top is visible in viewport, hide floating button
        if (bookingRect.top < window.innerHeight - 100) {
          setShowFloatingButton(false);
          return;
        }
      }
      
      // Only show floating button if hero button is out of view AND booking section is not in view
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        // When button scrolls out of view (above viewport)
        if (buttonRect.bottom < 0) {
          setShowFloatingButton(true);
        } else {
          setShowFloatingButton(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    // Also check on mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
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
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBooking = () => {
    const element = document.getElementById("booking-section");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get symptom description based on score
  const getSymptomDescription = () => {
    if (mockScore <= 4) return "Minimal mood disturbance - occasional low feelings";
    if (mockScore <= 9) return "Mild symptoms - some days feel harder than others";
    if (mockScore <= 14) return "Moderate symptoms - daily struggle with energy and motivation";
    if (mockScore <= 19) return "Moderately severe symptoms - significant impact on daily life";
    return "Severe symptoms - overwhelming feelings affecting all areas of life";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Urgency Bar under Nav */}
      <div className="bg-blue-600 text-white text-center py-2 px-4 fixed top-16 left-0 right-0 z-40 animate-pulse">
        <div className="flex flex-col items-center justify-center gap-1 font-semibold text-xs sm:text-sm md:text-base">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce" />
            <span>Hurry! We are running out...fast!</span>
          </div>
          <div>Only {timeLeft.days} days left at ₹299</div>
        </div>
      </div>

      {/* Floating CTA Button - Desktop */}
      {showFloatingButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 md:block hidden"
        >
          <Button
            size="lg"
            onClick={scrollToBooking}
            className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Book Your Clarity Call Now
          </Button>
        </motion.div>
      )}

      {/* Floating CTA Button - Mobile */}
      {showFloatingButton && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <Button
            size="lg"
            onClick={scrollToBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Book Your Clarity Call Now
          </Button>
        </motion.div>
      )}

      {/* SCREEN 1: Score + Recovery Timeline (No Hero, Direct Results) */}
      <section ref={heroSectionRef} className="pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 bg-gradient-to-b from-white via-blue-50 to-white">
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
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                  <span style={{ color: primary }}>{mockScore}</span>{" "}
                  <span className="text-xl sm:text-2xl md:text-3xl text-gray-600">/ {mockTotal}</span>
                </div>
                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 text-orange-700 rounded-full text-sm sm:text-lg font-semibold">
                  {mockLevel}
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-700 font-medium px-2">{getSymptomDescription()}</p>
            </div>
          </motion.div>

          {/* Recovery Timeline Comparison */}
          {isLoading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
                <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-2 sm:border-3 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-sm sm:text-lg">Calculating your personalized recovery timeline...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-blue-200"
            >
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  How Long Will It Take You To Feel Better?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-red-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-red-200">
                    <div className="text-lg sm:text-xl md:text-2xl text-gray-500 line-through mb-2">Usually takes 6 months</div>
                    <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto" />
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Traditional therapy & self-help</p>
                  </div>
                  <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2" style={{ color: primary }}>
                      GuildUp: <span className="text-3xl sm:text-4xl md:text-5xl">{mockRecoveryDays}</span> days
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Based on your score</p>
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto" />
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Our proven framework</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                    Most people at your stage start feeling{" "}
                    <span style={{ color: primary }}>
                      <span className="text-xl sm:text-2xl font-bold">50–70%</span> better in the first{" "}
                      <span className="text-xl sm:text-2xl font-bold">30 days</span>
                    </span>
                  </p>
                </div>
                {/* CTA Button */}
                <motion.div 
                  ref={buttonRef}
                  className="pt-2 sm:pt-4"
                  animate={showFloatingButton ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="lg"
                    onClick={scrollToBooking}
                    className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                  >
                    Book Your Clarity Call Now
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Get your personalized recovery roadmap</p>
                </motion.div>
              </div>
            </motion.div>
          )}
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center">
              What Your Score of{" "}
              <span style={{ color: primary }}>{mockScore}</span>/{mockTotal} Really Means
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center px-2">
              You&apos;re experiencing{" "}
              <span className="font-bold" style={{ color: primary }}>{mockLevel.toLowerCase()}</span> that are impacting your daily life
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
                    <span className="text-gray-700">{symptom}</span>
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
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 rounded-lg p-4 sm:p-6" style={{ borderColor: primary }}>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                The Truth:{" "}
                <span style={{ color: primary }}>
                  Anxiety, depression, and toxic relationship loops aren&apos;t thought problems. They&apos;re nervous system problems.
                </span>
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 mt-2 sm:mt-3">
                Your mind and nervous system have been stuck in survival mode — reacting like you&apos;re under threat even when you&apos;re safe.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCREEN 3: The GuildUp Framework - HOW We Do It */}
      <section className="py-8 sm:py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-2">
              How <span style={{ color: primary }}>GuildUp</span> Framework Fixes This in{" "}
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl" style={{ color: primary }}>
                {mockRecoveryDays} Days
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
                  "You&apos;re tired of feeling anxious, depressed, or stuck in the same relationship patterns",
                  "You&apos;ve tried therapy, pills, meditation, or self-help but nothing lasted",
                  "You wake up tired, anxious, and emotionally on edge — even after &apos;doing everything right&apos;",
                  "You overthink every small thing and feel low for no reason",
                  "You want to understand WHY you feel this way, not just manage symptoms",
                  "You&apos;re ready to reset your nervous system and feel safe, stable, and connected again",
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
                  "You&apos;re looking for a quick fix or magic pill",
                  "You&apos;re not ready to take action or commit to consistent habits",
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
                // Highlight numbers in the text (including patterns like "10+")
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
                  
                  // Special handling for specific coaches
                  if (name.toLowerCase().includes("anahata") || name.toLowerCase().includes("annie")) {
                    name = "Annie";
                  }
                  
                  // Extract first name for "Coach [Name]" format
                  // Handle names like "Therapy with Divya" or "Divya Mittar (Therapy with Divya)"
                  let firstName = name;
                  // Remove content in parentheses
                  firstName = firstName.replace(/\([^)]*\)/g, "").trim();
                  // Split by spaces and find the actual name (skip common words like "Therapy", "with", etc.)
                  const words = firstName.split(" ");
                  const skipWords = ["therapy", "with", "coach", "the", "by", "anahata", "by"];
                  firstName = words.find(word => 
                    word.length > 0 && !skipWords.includes(word.toLowerCase())
                  ) || words[0] || "Expert";
                  // Clean and capitalize
                  firstName = firstName.replace(/[^a-zA-Z]/g, "").trim();
                  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                  // Try multiple possible image fields
                  const avatar = 
                    communityDetails?.avatar_url || 
                    communityDetails?.profile_image || 
                    communityDetails?.avatar ||
                    communityDetails?.image ||
                    communityDetails?.profile_picture ||
                    "";
                  return (
                    <div
                      key={idx}
                      className="text-center"
                    >
                      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden mb-4 bg-gray-100 border-4 shadow-lg" style={{ borderColor: primary }}>
                        {avatar ? (
                          <img 
                            src={avatar} 
                            alt={name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
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
              {mockTestimonials.map((testimonial, idx) => {
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
      <section id="booking-section" className="py-8 sm:py-12 px-4 bg-white pb-24 sm:pb-12">
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
                <Input value={mockName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Phone</Label>
                <Input value={mockPhone} disabled className="bg-gray-50" />
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Date</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {mockSlots
                    .filter((slot, idx, arr) => arr.findIndex((s) => format(s.date, "yyyy-MM-dd") === format(slot.date, "yyyy-MM-dd")) === idx)
                    .slice(0, 3)
                    .map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(slot.date)}
                        className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm ${
                          format(selectedDate, "yyyy-MM-dd") === format(slot.date, "yyyy-MM-dd")
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-semibold">{format(slot.date, "EEE")}</div>
                        <div className="text-[10px] sm:text-xs text-gray-600">{format(slot.date, "MMM d")}</div>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Select Time</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {mockSlots
                    .filter((slot) => format(slot.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                    .map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm ${
                          selectedTime === slot.time
                            ? "border-blue-600 bg-blue-50 font-semibold"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                </div>
              </div>
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
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-5 sm:py-6">
                Book My Clarity Call
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
