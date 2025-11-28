"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Sparkles, Calendar as CalendarIcon, Clock, Star, X } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { format, addDays } from "date-fns";
import { useCachedCommunities } from "@/hooks/useCachedCommunities";

// Mock data
const mockScore = 18;
const mockTotal = 27;
const mockLevel = "Moderate symptoms";
const mockRecoveryDays = 49;
const mockName = "John Doe";
const mockPhone = "+91 98765 43210";
const mockEmail = "john@example.com";

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

export default function Prototype1Page() {
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 12, minutes: 45 });

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
    // Simulate loading animation
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
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
    const element = document.getElementById("booking-card");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating CTA Button */}
      {showFloatingButton && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50 md:block hidden"
        >
          <Button
            size="lg"
            onClick={scrollToBooking}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-4 shadow-2xl rounded-full flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs line-through opacity-75">₹1,999</span>
              <span className="text-xl font-bold">₹299</span>
            </div>
            <div className="text-xs font-semibold">Book Now</div>
            <div className="text-[10px] text-red-200">Only {timeLeft.days} days left</div>
          </Button>
        </motion.div>
      )}

      {/* Mobile Floating Button */}
      {showFloatingButton && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-2xl p-3"
        >
          <Button
            size="lg"
            onClick={scrollToBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-5 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm line-through opacity-75">₹1,999</span>
              <span className="text-xl font-bold">₹299</span>
            </div>
            <span className="ml-2">Book Now</span>
          </Button>
          <div className="text-center text-xs text-red-600 font-semibold mt-1">Only {timeLeft.days} days left</div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Recovery Timeline</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-lg font-bold text-blue-600">
                  {mockScore}/{mockTotal}
                </div>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                {mockLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          {/* LEFT SIDE - 70% Scrollable Story */}
          <div className="space-y-12">
            {/* 1. Score Reveal Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Your Score: {mockScore}/{mockTotal}
                  </h2>
                  <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-lg font-semibold">
                    {mockLevel}
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4 py-8">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-base font-normal">Calculating your recovery timeline...</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-3xl font-bold text-blue-600 mb-2">
                        Recovery Timeline: {mockRecoveryDays} Days
                      </h3>
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg text-gray-500 line-through">Usually takes 6 months</div>
                          <X className="w-5 h-5 text-red-500 mx-auto mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">Guildup: {mockRecoveryDays} days</div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mt-1" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* 2. The Problem Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                You&apos;ve Been Treating Symptoms, Not The System
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                The old ways of fixing anxiety, depression, and relationship struggles are not just outdated — they&apos;re a trap.
              </p>
              <div className="space-y-4 mb-6">
                {[
                  "Talk about your feelings in therapy, hoping understanding will change how you feel",
                  "Take pills to 'manage' anxiety or mood swings",
                  "Meditate your way to calm",
                  "Read self-help books and listen to podcasts, chasing motivation that never lasts",
                  "Keep a gratitude journal even when your mind won't stop racing",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-lg font-semibold text-gray-900">
                  The Truth: Anxiety, depression, and toxic relationship loops aren&apos;t thought problems.
                  <br />
                  <span className="text-blue-600">They&apos;re nervous system problems.</span>
                </p>
              </div>
            </motion.div>

            {/* 3. The Solution Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Guildup Deep Mind Reset Framework
              </h2>
              <div className="space-y-6">
                {[
                  { step: "Step 1", title: "Deep Mind Assessment", desc: "Complete mapping of your inner system" },
                  { step: "Step 2", title: "Nervous System Reset", desc: "Release tension and shift to calm state" },
                  { step: "Step 3", title: "Cognitive Reframing", desc: "Spot and stop thought patterns" },
                  { step: "Step 4", title: "Emotional Release", desc: "Understand triggers and release emotions" },
                  { step: "Step 5", title: "Personalized Roadmap", desc: "Clear action plan for your recovery" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 4. Coaches Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Top Coaches</h2>
              <p className="text-lg text-gray-600 mb-8">Expert guidance from India&apos;s most trusted mental health professionals</p>
              {loadingCommunities ? (
                <div className="text-center py-8">Loading coaches...</div>
              ) : coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coaches.map((coach: any, idx: number) => {
                    const communityDetails = coach?.community || coach;
                    const name = communityDetails?.name || "Expert";
                    const avatar = communityDetails?.avatar_url || communityDetails?.profile_image || "";
                    const title = communityDetails?.title || communityDetails?.bio || "";
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow text-center"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 bg-gray-100">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{name}</h3>
                        {title && <p className="text-sm text-gray-600 line-clamp-2">{title}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No coaches available</div>
              )}
            </motion.div>

            {/* 5. Testimonials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hear From Real People</h2>
              <p className="text-lg text-gray-600 mb-8">2,500+ people have reset their mind and nervous system</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockTestimonials.map((testimonial, idx) => {
                  const initials = getInitials(testimonial.author);
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
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

            {/* 6. Urgency & Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm border-2 border-blue-200"
            >
              <div className="text-center space-y-4">
                <div className="text-lg font-semibold text-gray-700">⏰ Only 20 spots available this month</div>
                <div className="text-lg font-semibold text-red-600">⏰ Only {timeLeft.days} days left at ₹299</div>
                <Button size="lg" onClick={scrollToBooking} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Your Journey Now
                </Button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE - 30% Fixed Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div id="booking-card" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Your Clarity Call</h2>
              
              {/* Prefilled Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <Input value={mockName} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <Input value={mockPhone} disabled className="bg-gray-50" />
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <Label className="text-sm text-gray-600 mb-2 block">Select Date</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockSlots
                    .filter((slot, idx, arr) => arr.findIndex((s) => format(s.date, "yyyy-MM-dd") === format(slot.date, "yyyy-MM-dd")) === idx)
                    .slice(0, 2)
                    .map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(slot.date)}
                        className={`p-3 rounded-lg border-2 text-sm ${
                          format(selectedDate, "yyyy-MM-dd") === format(slot.date, "yyyy-MM-dd")
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-semibold">{format(slot.date, "EEE")}</div>
                        <div className="text-xs text-gray-600">{format(slot.date, "MMM d")}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <Label className="text-sm text-gray-600 mb-2 block">Select Time</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockSlots
                    .filter((slot) => format(slot.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                    .map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-2 rounded-lg border-2 text-sm ${
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

              {/* Price Display */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg line-through text-gray-400 flex items-center gap-1">
                      <FaRupeeSign className="w-4 h-4" />
                      1,999
                    </span>
                    <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                      <FaRupeeSign className="w-5 h-5" />
                      299
                    </span>
                  </div>
                </div>
                <div className="text-xs text-red-600 font-semibold">Save 85%</div>
              </div>

              {/* CTA Button */}
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mb-3">
                Book Now - ₹299
              </Button>

              <div className="text-xs text-center text-gray-600">
                <div className="text-red-600 font-semibold mb-1">Only 3 slots left today</div>
                <div>Secure payment • Instant confirmation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

