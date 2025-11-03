"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import {
  Star,
  Heart,
  Brain,
  Sparkles,
  Users,
  HeartPulse,
  Moon,
  Zap,
  BatteryLow,
  Cloud,
  Utensils,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/constants";


function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {children}
      </div>
    </section>
  );
}

function TopCTA() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link href="/find-expert?startStep=2">
        <Button size="lg" className="px-6">
          Start Your 30-Day Journey
        </Button>
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-indigo-50">
      <div className="w-full py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-sm mb-6">
            <Sparkles className="h-4 w-4" /> Stress & Anxiety Program
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            You’ve carried enough.<br />Let’s help you feel lighter in 30 days.
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
            Through guided coaching, small daily practices, and consistent accountability, we help you get back on track — calmly, steadily, and without overwhelm.
          </p>
          <div className="flex justify-center">
            <TopCTA />
          </div>
          <div className="mt-4 text-sm text-gray-600">⭐ 4.9 • 5000+ people supported</div>
        </div>
      </div>
    </section>
  );
}

function WhatIsAndIn60Days() {
  return (
    <SectionWrapper>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What’s Really Happening Inside You</h2>
          <p className="text-gray-700 leading-relaxed">
            Stress and anxiety don’t just live in your mind — they live in your body:
            racing heartbeat, shallow breath, sleepless nights. Your body isn’t failing
            you; it’s protecting you. Those signals mean you’ve been in survival mode
            for too long. You can teach your body to feel safe and exhale again.
          </p>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">In Just 30 Days</h2>
          <p className="text-gray-700 leading-relaxed">
            You’ll begin to feel your body exhale again. Your thoughts will slow down,
            the chaos will soften, and the heaviness will lift. This isn’t perfection —
            it’s real, visible, lasting progress.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}

function Symptoms() {
  const items = [
    { icon: <HeartPulse className="h-6 w-6 text-indigo-600" />, label: "Tight chest" },
    { icon: <Moon className="h-6 w-6 text-indigo-600" />, label: "Poor sleep" },
    { icon: <Brain className="h-6 w-6 text-indigo-600" />, label: "Racing thoughts" },
    { icon: <Zap className="h-6 w-6 text-indigo-600" />, label: "Irritability" },
    { icon: <BatteryLow className="h-6 w-6 text-indigo-600" />, label: "Fatigue" },
    { icon: <Cloud className="h-6 w-6 text-indigo-600" />, label: "Overwhelm" },
    { icon: <Users className="h-6 w-6 text-indigo-600" />, label: "People-pleasing" },
    { icon: <Utensils className="h-6 w-6 text-indigo-600" />, label: "Appetite shifts" },
  ];
  return (
    <SectionWrapper>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Are you experiencing these?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {items.map((it) => (
          <Card
            key={it.label}
            className="bg-white border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-5 sm:p-6 lg:p-7 flex flex-col items-center text-center gap-3 sm:gap-3.5 min-h-[140px] sm:min-h-[180px] lg:min-h-[210px] justify-center">
              <div className="text-indigo-600">
                {React.cloneElement(it.icon as any, {
                  className: "h-8 w-8 sm:h-9 sm:w-9 lg:h-12 lg:w-12 text-indigo-600",
                })}
              </div>
              <div className="text-gray-900 font-semibold text-sm sm:text-base lg:text-lg">
                {it.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-gray-700 max-w-2xl mx-auto">Sound familiar? Let’s build your personalized 30‑day calm plan.</p>
      <div className="mt-6 flex justify-center">
        <TopCTA />
      </div>
    </SectionWrapper>
  );
}

function Approach() {
  const steps = [
    {
      icon: <Brain className="h-5 w-5" />, title: "Understand & Reflect",
      points: [
        "Guided Clarity Session",
        "Notice what’s driving your stress",
        "Thoughts, habits and emotions underneath",
      ],
    },
    {
      icon: <Heart className="h-5 w-5" />, title: "Rebuild Routine Safety",
      points: [
        "Simple 30-day plan from your coach",
        "Short daily tools that fit your routine",
        "Grounding, breathwork, reflection exercises",
      ],
    },
    {
      icon: <Sparkles className="h-5 w-5" />, title: "Stay Accountable & Grow",
      points: [
        "Regular check-ins and gentle nudges",
        "Build consistency without overwhelm",
        "Stay calm even when life gets messy",
      ],
    },
  ];
  return (
    <section className="w-full bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-indigo-600 font-semibold tracking-wide">Trusted by 5000+ people</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 leading-tight">
            HOW WE SOLVE IT<br />
            <span className="text-gray-900">“Our 3-Step Healing Framework”</span>
          </h2>
          <p className="text-gray-600 mt-4">Clear, practical, and human — built to help you feel safe, consistent, and back in control.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s, idx) => (
            <Card key={s.title} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                    {s.icon}
                    <span>{s.title}</span>
                  </div>
                </div>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/find-expert?startStep=2">
            <Button size="lg" className="px-6">Start Your 30-Day Journey</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

type Testimonial = { quote: string; nameCity: string; stars?: number };

function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "I didn’t realise how much I’d been holding in until Shreya helped me slow down. She gave me tiny reflection prompts and 5-minute breathwork routines — and somehow, that was enough to make me feel in control again.",
      nameCity: "Riya — Pune",
      stars: 5,
    },
    {
      quote:
        "Debankita kept checking in even when I missed my practices. I never felt judged — just supported. Within two weeks, my mornings didn’t feel so heavy anymore.",
      nameCity: "Anita — Bengaluru",
      stars: 5,
    },
    {
      quote:
        "What I liked most about Nikkar was how practical she was. She didn’t tell me to meditate for an hour — she taught me how to calm down in 90 seconds.",
      nameCity: "Kabir — Gurugram",
      stars: 5,
    },
    {
      quote:
        "Each week had one focus. We worked on sleep, then boundaries, then overthinking. It was small steps, but I can finally breathe properly again.",
      nameCity: "Meera — Mumbai",
      stars: 5,
    },
    {
      quote:
        "The exercises were simple — grounding, journaling, small body stretches. But what changed everything was having someone who kept me accountable.",
      nameCity: "Sana — Hyderabad",
      stars: 5,
    },
    {
      quote:
        "Before this, I thought stress was just part of life. Now I know what calm actually feels like.",
      nameCity: "Ishita — Delhi",
      stars: 5,
    },
  ];
  return (
    <SectionWrapper>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Real People. Real Progress.</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {testimonials.map((t, idx) => (
          <Card key={idx} className="bg-white border-gray-200 h-full">
            <CardContent className="pt-6 flex flex-col gap-3">
              <div className="flex text-amber-500">
                {Array.from({ length: t.stars || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-800">{t.quote}</p>
              <div className="text-sm text-gray-600 font-medium">{t.nameCity}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}

type Community = {
  _id: string;
  name: string;
  user_id: string;
  image?: string;
  languages?: string[];
  owner_experience?: number;
  owner_sessions?: number;
  tags?: any[];
} & Record<string, any>;

function Experts() {
  const [experts, setExperts] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const TARGET_NAMES = [
    "Heal with Bhakti",
    "Evolve with Naina",
    "Shreya | ICF- Certified Life Coach",
    "Millennial Life with Coach Jas",
    "Bettermind with Nikhar",
    "Inner Alchemy by Priyanka",
  ];

  useEffect(() => {
    const fetchAllAndFilter = async () => {
      setLoading(true);
      try {
        let allResp;
        try {
          allResp = await axios.get(
            `${API_BASE_URL}/v1/community/all?page=0&limit=500`
          );
        } catch (error) {
          // If API fails, fetch from JSON fallback
          console.log("API endpoint not available, fetching from JSON");
          const response = await fetch("/api/communities", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const jsonData = await response.json();
          allResp = { data: { data: jsonData } };
        }
        const all = Array.isArray(allResp?.data?.data) ? allResp.data.data : [];

        const normalize = (s: string) =>
          s
            .toLowerCase()
            .replace(/\s*\|\s*/g, " | ")
            .replace(/\s+/g, " ")
            .replace(/–|—/g, "-")
            .trim();

        // Build lookup on both top-level and nested community objects
        const flattened: Community[] = all.map((c: any) => (c?.community ? { ...c.community, ...c } : c));
        const byName: Record<string, Community> = {} as any;
        flattened.forEach((c: any) => {
          const nm = normalize(String(c?.name || ""));
          if (nm) byName[nm] = c as Community;
        });

        // Only use exact matches - no fuzzy fallbacks to avoid showing wrong experts
        const picked: Community[] = TARGET_NAMES.map((n) => byName[normalize(n)]).filter(Boolean);

        // Preserve order based on TARGET_NAMES
        const ordered = TARGET_NAMES.map((t) => picked.find((p) => normalize(p.name) === normalize(t))).filter(Boolean) as Community[];
        setExperts(ordered);
      } catch (e) {
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAndFilter();
  }, []);

  return (
    <SectionWrapper>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Meet Our Experts</h2>
        <div className="text-sm text-gray-500">Curated coaches for Stress & Anxiety</div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Users className="h-6 w-6 mr-2" /> Loading experts…
        </div>
      ) : experts.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {experts.map((c) => {
            const seedValue = c._id || (c.name && `${c.name}-${c.user_id || Date.now()}`);
            // Handle both top-level and nested community structure (same as home page)
            const communityDetails = (c as any)?.community || c;
            const avatarUrl = communityDetails.image;
            const languages = c.languages?.join(", ") || "English, Hindi";
            const exp = c.owner_experience ? `${c.owner_experience}+ years` : "5+ years";
            const sessions = c.owner_sessions ? `${c.owner_sessions}` : "200+";
            const tags: string[] = Array.isArray(c.tags)
              ? Array.from(new Set(
                  c.tags.flatMap((t: any) =>
                    typeof t === "string"
                      ? t.split(",").map((x) => x.trim()).filter(Boolean)
                      : Array.isArray(t)
                        ? t.flat().map((x: string) => x.trim())
                        : []
                  )
                ))
              : [];
            return (
              <Card key={c._id} className="p-0 h-[540px] sm:h-[560px] flex flex-col border border-gray-200 overflow-hidden relative rounded-xl">
                <div className="w-full h-72 relative overflow-hidden bg-gray-100">
                  <Image
                    src={avatarUrl || "/placeholder.svg"}
                    alt={c.name}
                    fill
                    style={{
                      objectPosition: 'center 20%',
                      objectFit: 'contain'
                    }}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      
                      if (aspectRatio < 0.8) {
                        img.style.objectPosition = 'center 15%';
                      } else if (aspectRatio < 1.2) {
                        img.style.objectPosition = 'center 18%';
                      } else if (aspectRatio < 1.8) {
                        img.style.objectPosition = 'center 22%';
                      } else {
                        img.style.objectPosition = 'center 25%';
                      }
                    }}
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                      <span className="text-sm text-gray-600">⭐ 4.9 / 5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-full">✓ Verified Expert</span>
                      <span className="text-sm text-gray-600">{languages}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎓</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{exp}</div>
                            <div className="text-xs text-gray-500">Experience</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{sessions}</div>
                            <div className="text-xs text-gray-500">Sessions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[80px] content-start">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* intentionally no CTA button and no click handlers */}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-600">No experts found right now.</div>
      )}
    </SectionWrapper>
  );
}

function CTAFullWidth() {
  return (
    <SectionWrapper>
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">Ready to take back control of your life?</h3>
        <p className="opacity-90 mb-4">Take the first step — our team will match you with the right coach for you.</p>
        <Link href="/find-expert?startStep=2">
          <Button size="lg" variant="secondary" className="px-6">
            Start Your Journey
          </Button>
        </Link>
        <div className="mt-3 text-sm opacity-90">No pressure • Expert-matched • 5000+ people guided</div>
      </div>
    </SectionWrapper>
  );
}

function FAQSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const faqs = [
    {
      q: "How does the program work?",
      a: "Each week, you’ll have a one-hour coaching session focused on reflection, calm-building, and small daily practices. Between sessions, your coach and our team stay connected with you on WhatsApp to keep you accountable and supported.",
    },
    {
      q: "How long is the program?",
      a: "It’s a 30-day journey with one session every week. Most people start noticing visible changes within the first month itself.",
    },
    { q: "Can I extend or add more sessions later?", a: "Yes, you can always continue with extra sessions or move to a longer plan if you’d like deeper guidance after the first month." },
    { q: "Can I pay session-by-session?", a: "No — it’s a monthly plan. Consistency matters for real results, so we work with you through the full 30-day journey." },
    { q: "Is this the same as therapy?", a: "No. Coaching is different — it’s practical, science backed and action-oriented. It helps you build habits, train your mind, and become emotionally stronger — like fitness for your inner self." },
    { q: "How are sessions conducted?", a: "All sessions happen online through Google Meet. Once you join, we’ll create a WhatsApp group with you, your coach, and our support team to help with scheduling and progress." },
    { q: "What kind of results can I expect?", a: "You’ll start feeling calmer, sleeping better, and responding to stress with more ease — usually within the first 2–3 weeks." },
    { q: "What if I can’t attend a session?", a: "No worries — sessions are flexible. You can reschedule easily by informing your coach in advance." },
  ];
  if (!mounted) return null;
  return (
    <SectionWrapper>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-left">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-4xl">
        {faqs.map((f, idx) => (
          <AccordionItem key={f.q} value={`item-${idx}`}>
            <AccordionTrigger className="text-base sm:text-lg font-medium text-gray-900">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionWrapper>
  );
}

export default function StressAndAnxietyPage() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <Hero />
      <WhatIsAndIn60Days />
      <Symptoms />
      <Approach />
      <Testimonials />
      <CTAFullWidth />
      <Experts />
      <FAQSection />
      <Footer />
    </div>
  );
}


