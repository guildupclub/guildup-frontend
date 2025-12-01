"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setUser } from "@/redux/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  User, 
  Heart, 
  ArrowRight, 
  ArrowLeft,
  PartyPopper,
  Rocket,
  Star
} from "lucide-react";
import { savePersonality, saveCompatibilityAssessment } from "@/lib/api/friendship";

type OnboardingStep = "phone-otp" | "basic-info" | "personality" | "compatibility" | "complete";

// Personality questions (15 questions)
const PERSONALITY_QUESTIONS = [
  { id: 1, text: "How do you typically spend your free time?", options: [
    "Alone or with close friends", "With a large group of friends", "Mix of both", "Depends on my mood", "I like to stay home"
  ]},
  { id: 2, text: "When faced with a challenge, I usually:", options: [
    "Take time to process", "Jump in immediately", "Ask for help first", "Research options", "Avoid it for a while"
  ]},
  { id: 3, text: "In group settings, I'm typically:", options: [
    "Quieter, listening more than talking", "Talkative and outgoing", "Adaptable based on the group", "Somewhere in between", "It depends on my energy level"
  ]},
  { id: 4, text: "How do you recharge after social interaction?", options: [
    "Alone or with close friends", "With a large group of people", "Depends on my mood", "I like activities, not just conversation", "Varies greatly"
  ]},
  { id: 5, text: "When making decisions, you:", options: [
    "Think through all options carefully", "Go with your gut feeling", "Ask others for advice", "Weigh pros and cons", "Delay making the decision"
  ]},
  { id: 6, text: "Your ideal weekend involves:", options: [
    "Quiet time at home", "Social activities with friends", "A mix of both", "Adventure and new experiences", "Whatever feels right in the moment"
  ]},
  { id: 7, text: "When someone disagrees with you, you:", options: [
    "Listen and try to understand their perspective", "Defend your position", "Find common ground", "Avoid the conflict", "Enjoy the debate"
  ]},
  { id: 8, text: "You prefer plans that are:", options: [
    "Well-organized and scheduled", "Flexible and spontaneous", "A balance of both", "Made last minute", "Completely open-ended"
  ]},
  { id: 9, text: "In relationships, you value most:", options: [
    "Deep emotional connection", "Shared activities and fun", "Honest communication", "Independence and space", "Loyalty and trust"
  ]},
  { id: 10, text: "When stressed, you:", options: [
    "Need time alone to process", "Talk it out with others", "Engage in physical activity", "Distract yourself", "Analyze the situation"
  ]},
  { id: 11, text: "You're more likely to:", options: [
    "Follow established routines", "Try new things regularly", "Mix routine with novelty", "Go with the flow", "Plan everything in advance"
  ]},
  { id: 12, text: "Your communication style is:", options: [
    "Direct and straightforward", "Thoughtful and considerate", "Expressive and animated", "Reserved and measured", "Adaptive to the situation"
  ]},
  { id: 13, text: "You handle change by:", options: [
    "Embracing it enthusiastically", "Adjusting gradually", "Resisting initially", "Analyzing the impact", "Going with the flow"
  ]},
  { id: 14, text: "In friendships, you prioritize:", options: [
    "Quality over quantity", "Having many connections", "Deep, meaningful bonds", "Fun and shared experiences", "Mutual support"
  ]},
  { id: 15, text: "Your approach to life is:", options: [
    "Planned and organized", "Spontaneous and flexible", "Balanced between both", "Reactive to circumstances", "Driven by goals"
  ]},
];

// Compatibility assessment questions (10 questions)
const COMPATIBILITY_QUESTIONS = [
  { id: "values", text: "What's most important to you in a friendship?", options: [
    "Honesty and trust", "Fun and laughter", "Support during tough times", "Shared interests", "Personal growth together"
  ]},
  { id: "communication", text: "How do you prefer to communicate?", options: [
    "Face-to-face conversations", "Text messages", "Phone calls", "Video calls", "Mix of all methods"
  ]},
  { id: "conflict", text: "When there's a disagreement, you:", options: [
    "Address it immediately", "Take time to cool down first", "Avoid confrontation", "Seek to understand both sides", "Compromise quickly"
  ]},
  { id: "time", text: "How often do you like to connect with friends?", options: [
    "Daily", "A few times a week", "Weekly", "A few times a month", "Quality over frequency"
  ]},
  { id: "support", text: "When a friend needs help, you:", options: [
    "Drop everything to help", "Offer support within your capacity", "Listen and provide advice", "Give them space", "Check in regularly"
  ]},
  { id: "boundaries", text: "Your approach to personal boundaries:", options: [
    "Very clear and firm", "Flexible and open", "Depends on the person", "Respectful but adaptable", "Learning to set them"
  ]},
  { id: "growth", text: "You believe friendships should:", options: [
    "Help you grow as a person", "Provide comfort and stability", "Be fun and lighthearted", "Challenge your perspectives", "Support your goals"
  ]},
  { id: "trust", text: "Trust in friendship is built through:", options: [
    "Time and consistency", "Shared experiences", "Open communication", "Mutual respect", "Proven reliability"
  ]},
  { id: "space", text: "You need personal space:", options: [
    "Frequently", "Occasionally", "Rarely", "Only when stressed", "It varies"
  ]},
  { id: "future", text: "You see friendships as:", options: [
    "Lifelong commitments", "Evolving relationships", "Present connections", "Support networks", "Journeys of discovery"
  ]},
];

export default function FriendshipOnboardingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  
  const [step, setStep] = useState<OnboardingStep>("phone-otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Basic info
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [city, setCity] = useState("");
  
  // Personality quiz
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<number, string>>({});
  const [currentPersonalityQ, setCurrentPersonalityQ] = useState(0);
  
  // Compatibility assessment
  const [compatibilityAnswers, setCompatibilityAnswers] = useState<Record<string, string>>({});
  const [currentCompatQ, setCurrentCompatQ] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check if user is already logged in and handle invite code
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
    
    // Check for invite code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get("inviteCode");
    if (inviteCode) {
      sessionStorage.setItem("pendingInviteCode", inviteCode);
    }
    
    if (storedUser && userId) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.friendship_onboarding_completed) {
          // If there's a pending invite, accept it first
          if (inviteCode) {
            router.push(`/friendship/invite/${inviteCode}`);
          } else {
            router.push("/friendship/dashboard");
          }
        } else if (userData.personality_completed) {
          setStep("compatibility");
        } else if (userData.date_of_birth) {
          setName(userData.name || "");
          setDateOfBirth(userData.date_of_birth || "");
          setCity(userData.location || "");
          setStep("personality");
        } else {
          setName(userData.name || "");
          setStep("basic-info");
        }
      } catch (e) {
        // Continue with phone OTP
      }
    }
  }, [router]);

  // Request OTP
  const handleRequestOtp = async () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/request-otp`,
        { phone: phone.replace("+", "") }
      );

      if (response.data.r === "s") {
        setOtpSent(true);
        toast.success("OTP sent successfully! 🎉");
      } else {
        toast.error(response.data.e || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP
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
          name: name || "",
          otp,
        }
      );

      if (response.data.r === "s") {
        toast.success("Phone verified successfully! ✨");
        const { user: verifiedUser, token } = response.data.data;

        sessionStorage.setItem("user", JSON.stringify(verifiedUser));
        sessionStorage.setItem("name", verifiedUser.name);
        sessionStorage.setItem("id", verifiedUser._id);
        sessionStorage.setItem("token", token);

        dispatch(setUser(verifiedUser));

        setName(verifiedUser.name || "");
        setOtp("");
        setOtpSent(false);
        setStep("basic-info");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit basic info
  const handleSubmitBasicInfo = async () => {
    if (!name || !dateOfBirth) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate age (18+)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      toast.error("You must be 18 or older to use GuildUp");
      return;
    }

    // Save basic info to backend
    try {
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
      const phone = typeof window !== "undefined" ? sessionStorage.getItem("phone") || "" : "";
      if (userId) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/profile/wati/addContact`,
          {
            userId,
            name,
            phone,
            date_of_birth: dateOfBirth,
            location: city || undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${typeof window !== "undefined" ? sessionStorage.getItem("token") : ""}`,
            },
          }
        );

        // Update user in sessionStorage
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.date_of_birth = dateOfBirth;
          userData.location = city;
          sessionStorage.setItem("user", JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Failed to save basic info:", error);
      // Continue anyway
    }

    setStep("personality");
    toast.success("Great start! ✨");
  };

  // Submit personality quiz
  const handleSubmitPersonality = async () => {
    if (Object.keys(personalityAnswers).length < PERSONALITY_QUESTIONS.length) {
      toast.error("Please answer all questions");
      return;
    }

    setIsSubmitting(true);
    try {
      const responses = PERSONALITY_QUESTIONS.map((q) => ({
        question_id: q.id,
        answer: personalityAnswers[q.id],
      }));

      await savePersonality(responses);

      // Update user in sessionStorage
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.personality_completed = true;
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      toast.success("Personality unlocked! 🎊");
      setStep("compatibility");
    } catch (error: any) {
      toast.error(error.message || "Failed to save personality profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit compatibility assessment
  const handleSubmitCompatibility = async () => {
    if (Object.keys(compatibilityAnswers).length < COMPATIBILITY_QUESTIONS.length) {
      toast.error("Please answer all questions");
      return;
    }

    setIsSubmitting(true);
    try {
      const responses = COMPATIBILITY_QUESTIONS.map((q) => ({
        question_id: q.id,
        answer: compatibilityAnswers[q.id] ? COMPATIBILITY_QUESTIONS.find(cq => cq.id === q.id)?.options.indexOf(compatibilityAnswers[q.id]) || 0 : 0,
      }));

      await saveCompatibilityAssessment(responses);

      // Update user in sessionStorage
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.friendship_onboarding_completed = true;
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      setShowCelebration(true);
      
      // Check for pending invite code
      const pendingInviteCode = sessionStorage.getItem("pendingInviteCode");
      setTimeout(() => {
        if (pendingInviteCode) {
          sessionStorage.removeItem("pendingInviteCode");
          router.push(`/friendship/invite/${pendingInviteCode}`);
        } else {
          router.push("/friendship/dashboard");
        }
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save compatibility assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Celebration animation
  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <PartyPopper className="h-24 w-24 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4">You&apos;re All Set! 🎉</h1>
          <p className="text-2xl mb-8">Ready to connect with friends!</p>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Rocket className="h-16 w-16 mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <CardTitle className="text-3xl text-gray-900">Welcome to GuildUp! 🚀</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-gray-900">
          <AnimatePresence mode="wait">
            {/* Phone OTP Step */}
            {step === "phone-otp" && (
              <motion.div
                key="phone-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900">Let&apos;s Get Started! ✨</h2>
                  <p className="text-gray-600">Enter your phone number to begin</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-900">Phone Number</Label>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={phone}
                      onChange={(value) => setPhone(value || "")}
                      className="mt-2"
                    />
                  </div>

                  {!otpSent ? (
                    <Button onClick={handleRequestOtp} className="w-full" size="lg">
                      Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp" className="text-gray-900">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="mt-2 text-center text-2xl tracking-widest"
                        />
                      </div>
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isVerifying || otp.length !== 6}
                        className="w-full"
                        size="lg"
                      >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                        {!isVerifying && <CheckCircle2 className="ml-2 h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Basic Info Step */}
            {step === "basic-info" && (
              <motion.div
                key="basic-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <User className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Tell Us About Yourself</h2>
                  <p className="text-sm sm:text-base text-gray-600">Step 1 of 3</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dob" className="text-gray-900">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-gray-900">City (Optional)</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter your city"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("phone-otp")}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleSubmitBasicInfo} className="flex-1" size="lg">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Personality Quiz Step */}
            {step === "personality" && (
              <motion.div
                key="personality"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Heart className="h-12 w-12 mx-auto mb-4 text-pink-500" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900">Personality Assessment</h2>
                  <p className="text-gray-600">
                    Question {currentPersonalityQ + 1} of {PERSONALITY_QUESTIONS.length}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <motion.div
                      className="bg-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentPersonalityQ + 1) / PERSONALITY_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {currentPersonalityQ < PERSONALITY_QUESTIONS.length && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {PERSONALITY_QUESTIONS[currentPersonalityQ].text}
                    </h3>
                    <RadioGroup
                      value={personalityAnswers[PERSONALITY_QUESTIONS[currentPersonalityQ].id] || ""}
                      onValueChange={(value) => {
                        setPersonalityAnswers({
                          ...personalityAnswers,
                          [PERSONALITY_QUESTIONS[currentPersonalityQ].id]: value,
                        });
                      }}
                    >
                      {PERSONALITY_QUESTIONS[currentPersonalityQ].options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 bg-white">
                          <RadioGroupItem value={option} id={`opt-${idx}`} />
                          <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-gray-900">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentPersonalityQ > 0) {
                            setCurrentPersonalityQ(currentPersonalityQ - 1);
                          } else {
                            setStep("basic-info");
                          }
                        }}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        onClick={() => {
                          if (currentPersonalityQ < PERSONALITY_QUESTIONS.length - 1) {
                            if (personalityAnswers[PERSONALITY_QUESTIONS[currentPersonalityQ].id]) {
                              setCurrentPersonalityQ(currentPersonalityQ + 1);
                              if ((currentPersonalityQ + 1) % 5 === 0) {
                                toast.success("You're doing great! 🔥");
                              }
                            } else {
                              toast.error("Please select an answer");
                            }
                          } else {
                            // On last question, submit instead of showing separate button
                            if (Object.keys(personalityAnswers).length === PERSONALITY_QUESTIONS.length) {
                              handleSubmitPersonality();
                            } else {
                              toast.error("Please answer all questions");
                            }
                          }
                        }}
                        disabled={
                          !personalityAnswers[PERSONALITY_QUESTIONS[currentPersonalityQ].id] ||
                          (currentPersonalityQ === PERSONALITY_QUESTIONS.length - 1 && (isSubmitting || Object.keys(personalityAnswers).length < PERSONALITY_QUESTIONS.length))
                        }
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          "Saving..."
                        ) : currentPersonalityQ < PERSONALITY_QUESTIONS.length - 1 ? (
                          <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : (
                          <>Complete Assessment <CheckCircle2 className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Compatibility Assessment Step */}
            {step === "compatibility" && (
              <motion.div
                key="compatibility"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  >
                    <Star className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900">Compatibility Assessment</h2>
                  <p className="text-gray-600">
                    Question {currentCompatQ + 1} of {COMPATIBILITY_QUESTIONS.length}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <motion.div
                      className="bg-yellow-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentCompatQ + 1) / COMPATIBILITY_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {currentCompatQ < COMPATIBILITY_QUESTIONS.length && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {COMPATIBILITY_QUESTIONS[currentCompatQ].text}
                    </h3>
                    <RadioGroup
                      value={compatibilityAnswers[COMPATIBILITY_QUESTIONS[currentCompatQ].id] || ""}
                      onValueChange={(value) => {
                        setCompatibilityAnswers({
                          ...compatibilityAnswers,
                          [COMPATIBILITY_QUESTIONS[currentCompatQ].id]: value,
                        });
                      }}
                    >
                      {COMPATIBILITY_QUESTIONS[currentCompatQ].options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 bg-white">
                          <RadioGroupItem value={option} id={`compat-opt-${idx}`} />
                          <Label htmlFor={`compat-opt-${idx}`} className="flex-1 cursor-pointer text-gray-900">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentCompatQ > 0) {
                            setCurrentCompatQ(currentCompatQ - 1);
                          } else {
                            setStep("personality");
                          }
                        }}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        onClick={() => {
                          if (currentCompatQ < COMPATIBILITY_QUESTIONS.length - 1) {
                            if (compatibilityAnswers[COMPATIBILITY_QUESTIONS[currentCompatQ].id]) {
                              setCurrentCompatQ(currentCompatQ + 1);
                            } else {
                              toast.error("Please select an answer");
                            }
                          } else {
                            // On last question, submit instead of showing separate button
                            if (Object.keys(compatibilityAnswers).length === COMPATIBILITY_QUESTIONS.length) {
                              handleSubmitCompatibility();
                            } else {
                              toast.error("Please answer all questions");
                            }
                          }
                        }}
                        disabled={
                          !compatibilityAnswers[COMPATIBILITY_QUESTIONS[currentCompatQ].id] ||
                          (currentCompatQ === COMPATIBILITY_QUESTIONS.length - 1 && (isSubmitting || Object.keys(compatibilityAnswers).length < COMPATIBILITY_QUESTIONS.length))
                        }
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          "Saving..."
                        ) : currentCompatQ < COMPATIBILITY_QUESTIONS.length - 1 ? (
                          <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : (
                          <>Complete Assessment <CheckCircle2 className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

