"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveInquiry } from "@/lib/services/diagnosticLeads";
import { primary, white, black } from "@/app/colours";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";

export default function RecommendationsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const [diagnosis, setDiagnosis] = useState<string | undefined>(undefined);
  const [labels, setLabels] = useState<string[] | undefined>(undefined);
  const [scoreTotal, setScoreTotal] = useState<number | undefined>(undefined);
  const [scoreLevel, setScoreLevel] = useState<string | undefined>(undefined);
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("ai_diagnostic_result");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { summary?: string; labels?: string[]; total?: number; level?: string };
          setDiagnosis(parsed?.summary);
          setLabels(parsed?.labels);
          if (typeof parsed?.total === "number") setScoreTotal(parsed.total);
          if (parsed?.level) setScoreLevel(parsed.level);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const guidance = useMemo(() => {
    const sev = (scoreLevel || diagnosis || "").toLowerCase();
    const hasRisk = (labels || []).includes("suicidality_risk");
    const base: { title: string; bullets: string[]; sessions?: string; caution?: string } = {
      title: "Suggested path",
      bullets: [],
      sessions: undefined,
      caution: undefined,
    };

    if (hasRisk) {
      base.caution = "If you're experiencing thoughts of self‑harm, seek immediate help from local emergency services or a crisis helpline.";
    }

    if (sev.includes("minimal")) {
      base.bullets = [
        "Maintain healthy sleep, nutrition, and movement routines",
        "Use mindfulness or journaling 10–15 mins daily",
        "Check‑in again if symptoms increase or persist",
      ];
      base.sessions = "0–2 optional brief check‑ins";
    } else if (sev.includes("mild")) {
      base.bullets = [
        "Begin brief therapy or coaching to build coping skills",
        "Practice daily stress‑reduction (breathing, walks, guided relaxation)",
        "Track triggers and wins weekly",
      ];
      base.sessions = "4–6 therapy sessions (weekly)";
    } else if (sev.includes("moderately severe")) {
      base.bullets = [
        "Start structured psychotherapy (CBT/ACT)",
        "Create a safety and support plan with your therapist",
        "Consider a psychiatric evaluation for medication options",
      ];
      base.sessions = "12–16 therapy sessions (weekly)";
    } else if (sev.includes("moderate")) {
      base.bullets = [
        "Begin evidence‑based therapy (CBT/ACT)",
        "Build a weekly routine for sleep, meals, and activity",
        "Involve a trusted friend/family member for support",
      ];
      base.sessions = "8–12 therapy sessions (weekly)";
    } else if (sev.includes("severe")) {
      base.bullets = [
        "Urgent psychiatric evaluation and safety planning",
        "Begin weekly psychotherapy with close monitoring",
        "Increase social support and reduce avoidable stressors",
      ];
      base.sessions = "16+ therapy sessions; frequency per clinician guidance";
    } else {
      base.bullets = [
        "Maintain healthy routines and monitor symptoms",
        "Consider a brief expert consultation for personalized tips",
      ];
      base.sessions = "As needed";
    }

    return base;
  }, [scoreLevel, diagnosis, labels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your name");
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError("Please provide either a mobile number or email address");
      return;
    }

    // Phone is required for saveInquiry, but we'll use email if phone is not provided
    if (!phone.trim()) {
      setError("Mobile number is required. Please provide your mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        concerns: `Diagnostic test results - Score: ${scoreTotal ?? "-"}, Level: ${scoreLevel || diagnosis || "N/A"}`,
        userId,
      });

      setIsSubmitted(true);
      toast.success("Thank you! We'll send you the full remedy and key techniques shortly.");
    } catch (err: any) {
      console.error("Error submitting contact information:", err);
      setError(err?.message || "Failed to submit. Please try again.");
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
            Your Test Results
          </h1>
          <p className="text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Personalized insights based on your assessment
          </p>
        </div>

        {/* Score Card - Highlighted with Primary Color */}
        {(scoreTotal !== undefined || scoreLevel) && (
          <div 
            className="relative p-6 sm:p-8 rounded-2xl shadow-lg overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primary}15 0%, ${primary}05 100%)`,
              border: `2px solid ${primary}30`
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: primary, transform: 'translate(20%, -20%)' }} />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ fontFamily: "'Poppins', sans-serif", color: primary }}>
                    PHQ-9 Assessment Score
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                    {scoreTotal ?? "-"}
                    {scoreLevel && (
                      <span className="text-2xl sm:text-3xl ml-2 font-semibold" style={{ color: primary }}>
                        ({scoreLevel})
                      </span>
                    )}
                  </div>
                </div>
                {diagnosis && (
                  <div className="text-sm sm:text-base text-gray-700 max-w-xs sm:text-right bg-white/60 backdrop-blur-sm p-3 rounded-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {diagnosis}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Form Section */}
        {!isSubmitted ? (
          <div 
            className="p-6 sm:p-8 rounded-2xl shadow-lg bg-white border-2"
            style={{ borderColor: `${primary}20` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${primary}15` }}>
                <ArrowRight className="w-5 h-5" style={{ color: primary }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                Get full remedy
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 ml-11" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Share your contact details to receive personalized remedies and key techniques based on your test results.
            </p>
            
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-200">
                <p className="text-sm text-red-700 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full h-11 border-2 focus:border-2 transition-colors"
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    borderColor: name ? `${primary}30` : undefined
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                  className="w-full h-11 border-2 focus:border-2 transition-colors"
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    borderColor: phone ? `${primary}30` : undefined
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                  Email Address <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-11 border-2 focus:border-2 transition-colors"
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    borderColor: email ? `${primary}30` : undefined
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !phone.trim() || !name.trim()}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ 
                  backgroundColor: (isSubmitting || !phone.trim() || !name.trim()) ? `${primary}70` : primary, 
                  color: white, 
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Get full remedy
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div 
            className="p-6 sm:p-8 rounded-2xl shadow-lg border-2"
            style={{ 
              backgroundColor: `${primary}05`,
              borderColor: `${primary}30`
            }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white shadow-md">
                <CheckCircle2 className="w-8 h-8" style={{ color: primary }} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                  Thank You!
                </h2>
                <p className="text-base text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  We have received your information. Our team will send you the full remedy and key techniques shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp CTA - Join Stress Program */}
        <div 
          className="p-6 sm:p-8 rounded-2xl shadow-lg border-2"
          style={{ 
            backgroundColor: `${primary}08`,
            borderColor: `${primary}30`
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                Join Our Stress Management Program
              </h3>
              <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Get personalized support and guidance from our Coaches. Start your wellness journey today.
              </p>
            </div>
            <Button
              onClick={() => {
                const message = encodeURIComponent("Hi!, I'd like to know more about Guildup's program.");
                window.open(`https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${message}`, '_blank');
              }}
              className="px-6 sm:px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <MessageCircle className="w-5 h-5" />
              Join on WhatsApp
            </Button>
          </div>
        </div>

        {/* Guidance Card - Suggested Path */}
        <div 
          className="p-6 sm:p-8 rounded-2xl shadow-md bg-white border-l-4"
          style={{ borderLeftColor: primary }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primary}15` }}>
              <Sparkles className="w-5 h-5" style={{ color: primary }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
              {guidance.title}
            </h2>
          </div>
          
          {guidance.sessions && (
            <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-sm font-medium mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
                Suggested Therapy Plan:
              </div>
              <div className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: primary }}>
                {guidance.sessions}
              </div>
            </div>
          )}
          
          <ul className="space-y-3">
            {guidance.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}15` }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                  </div>
                </div>
                <span className="text-sm sm:text-base text-gray-700 flex-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
          
          {guidance.caution && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <div className="text-red-600 mt-0.5">⚠️</div>
                <p className="text-sm text-red-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {guidance.caution}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


