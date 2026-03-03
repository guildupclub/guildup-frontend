"use client";

import React, { useState } from "react";
import { primary, white } from "@/app/colours";
import CollegeLeadForm from "./CollegeLeadForm";
import Footer from "@/components/layout/Footer";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";
import {
  Phone,
  Clock,
  Users,
  BarChart3,
  Shield,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  HeartPulse,
  Headphones,
  UserCheck,
  Sparkles,
  Brain,
  Globe,
  Lock,
  ArrowRight,
} from "lucide-react";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi, I'd like to learn more about GuildUp's mental health programme for colleges."
);

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "81%", label: "of Indian students cite exams and academic pressure as a major source of stress and anxiety" },
  { value: "1 in 7", label: "young Indians between 15 and 24 report feeling depressed or having little interest in daily activities" },
  { value: "37%", label: "of youth do not seek mental health support because they believe therapy is too expensive or inaccessible" },
];

const OFFERINGS = [
  {
    icon: Headphones,
    title: "24/7 Student Helpline",
    description: "Round-the-clock access to licensed counsellors via call, chat, or video. Because mental health needs do not follow office hours.",
  },
  {
    icon: HeartPulse,
    title: "1-on-1 Counselling Sessions",
    description: "Confidential tele-counselling with qualified psychologists who specialise in anxiety, depression, academic stress, relationships, and more.",
  },
  {
    icon: UserCheck,
    title: "On-Campus Counsellor Days",
    description: "Periodic in-person sessions by experienced professionals on your campus, for students who prefer face-to-face support.",
  },
  {
    icon: BookOpen,
    title: "Workshops and Faculty Training",
    description: "Interactive sessions on stress management, suicide prevention, peer support training, and mental health first-aid for faculty and staff.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard and Reporting",
    description: "Anonymised analytics, usage reports, and ready-to-submit data for UGC MANAS-SETU portal. One dashboard for complete visibility.",
  },
  {
    icon: Users,
    title: "Peer Support Programme",
    description: "Structured training for student volunteers to become peer well-being ambassadors. Builds a culture of care from within the campus.",
  },
];

const WHY_GUILDUP_NUMBERS = [
  { value: "10,000+", label: "Students supported" },
  { value: "50+", label: "Licensed counsellors" },
  { value: "20+", label: "Specialisations" },
  { value: "24/7", label: "Always available" },
];

const WHY_GUILDUP_FEATURES = [
  { icon: Brain, label: "Specialists across 20+ mental health areas" },
  { icon: Clock, label: "Available round the clock, including late nights and weekends" },
  { icon: Lock, label: "Completely private and confidential for every student" },
  { icon: Globe, label: "Online and on-campus support, based on your preference" },
];

const FAQS = [
  {
    question: "What does the UGC policy require from colleges regarding mental health?",
    answer: "The UGC's Uniform Policy on Mental Health and Well-being mandates that every HEI must set up a Mental Health and Well-Being Centre (MHWBC), provide access to qualified counsellors (at least 1 per 500 students), run a 24/7 helpline, conduct awareness campaigns, train faculty as gatekeepers, run peer-support programmes, and submit annual Student Wellness reports via the MANAS-SETU portal. The Supreme Court has reinforced that mental health support is an indispensable obligation of colleges, not a discretionary service.",
  },
  {
    question: "How does GuildUp help our institution meet UGC requirements?",
    answer: "GuildUp covers every key mandate under the UGC policy. We provide the 24/7 helpline, licensed counsellors for tele-therapy, on-campus counsellor sessions, faculty and peer training workshops, self-assessment tools, crisis response protocols, and a dashboard that generates reports compatible with MANAS-SETU requirements. We essentially function as your institution's extended mental health infrastructure.",
  },
  {
    question: "Is student data kept confidential?",
    answer: "Absolutely. All counselling sessions are strictly confidential. The admin dashboard only shows anonymised, aggregate data such as total sessions, utilisation trends, and common concern areas. No individual student details are ever shared with the institution. We follow DPDP Act guidelines and industry-best privacy standards.",
  },
  {
    question: "How is GuildUp priced for institutions?",
    answer: "We offer flexible pricing based on your student count and the services you choose. Options include per-student-per-year plans, annual campus-wide retainers, and modular packages where you pick the services you need. We are happy to discuss a plan that fits your budget. Request a callback and our team will walk you through the options.",
  },
  {
    question: "Can GuildUp provide counsellors who visit our campus in person?",
    answer: "Yes. We offer scheduled on-campus counsellor days where experienced professionals visit your institution for in-person sessions. This works especially well for orientation weeks, exam periods, or regular monthly visits. We can tailor the frequency and format based on your needs.",
  },
  {
    question: "How quickly can we get started?",
    answer: "Most institutions go live within 2 to 3 weeks. We handle the setup, configure your dashboard, onboard your admin team, and run an awareness session for students. There is minimal effort required from your side.",
  },
  {
    question: "What if students do not use the service?",
    answer: "Low utilisation is a common concern, and one we have solved for. We run targeted awareness campaigns, conduct engaging workshops, and provide self-assessment tools that encourage students to take the first step. Institutions that partner with us consistently see 5 to 7x higher engagement compared to traditional campus counselling setups.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function CollegeLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById("college-lead-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="min-h-screen bg-white">

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B47F9]/5 via-white to-[#3B47F9]/3" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: `${primary}10`, color: primary }}>
                <Sparkles className="w-4 h-4" />
                India&apos;s first dedicated mental health programme for colleges
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-5">
                Your Students Need Mental Health Support.{" "}
                <span style={{
                  backgroundImage: "linear-gradient(to right, hsl(230, 90%, 55%), hsl(215, 100%, 55%))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}>
                  We Make It Happen.
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                A dedicated mental health programme for your college with 50+ licensed counsellors, 24/7 helpline, on-campus and online counselling, workshops, and a reporting dashboard. All under one roof.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: primary, color: white }}
                >
                  Contact Us
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 hover:shadow-md flex items-center justify-center gap-2"
                  style={{ borderColor: primary, color: primary }}
                >
                  <Phone className="w-4 h-4" />
                  Schedule a Call
                </a>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 rounded-3xl rotate-3" style={{ backgroundColor: `${primary}08` }} />
                <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}12` }}>
                        <GraduationCap className="w-6 h-6" style={{ color: primary }} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">10,000+</div>
                        <div className="text-sm text-gray-500">Students supported</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}12` }}>
                        <HeartPulse className="w-6 h-6" style={{ color: primary }} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">50+</div>
                        <div className="text-sm text-gray-500">Licensed counsellors and therapists</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}12` }}>
                        <Clock className="w-6 h-6" style={{ color: primary }} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">24/7</div>
                        <div className="text-sm text-gray-500">Round-the-clock availability</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}12` }}>
                        <Shield className="w-6 h-6" style={{ color: primary }} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">UGC Aligned</div>
                        <div className="text-sm text-gray-500">Built for MANAS-SETU requirements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TRUST BAR ━━━ */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: primary }} />
              Licensed Clinical Professionals
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: primary }} />
              DPDP Act Compliant
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: primary }} />
              Evidence-Based Therapy
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: primary }} />
              Bilingual Support (Hindi + English)
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ THE PROBLEM ━━━ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Your Students Are Struggling. Most of Them in Silence.
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base leading-relaxed">
              Depression, anxiety, and suicides among college students are rising every year. And the majority never receive any professional support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div
                  className="text-4xl sm:text-5xl font-bold mb-3"
                  style={{
                    backgroundImage: "linear-gradient(to right, hsl(230, 90%, 55%), hsl(215, 100%, 55%))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 rounded-2xl border-l-4 bg-amber-50/60" style={{ borderColor: "#F59E0B" }}>
            <p className="text-gray-700 text-sm leading-relaxed">
              <span className="font-semibold">The UGC and the Supreme Court of India have made it clear:</span> mental health support is now an indispensable obligation for every college and university. Institutions must have a functioning Mental Health and Well-Being Centre, a 24/7 helpline, licensed counsellors, awareness programmes, and must report wellness data to the UGC annually.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ WHAT WE OFFER ━━━ */}
      <section className="py-16 sm:py-20 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything Your Campus Needs. One Partner.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base">
              From 24/7 crisis support to workshops and reporting, GuildUp covers every aspect of student mental health so you can focus on what you do best.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#3B47F9]/20 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primary}10` }}>
                    <Icon className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={scrollToForm}
              className="px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: primary, color: white }}
            >
              Get a Customised Plan for Your Institution
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ WHY GUILDUP ━━━ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Why Institutions Choose GuildUp
            </h2>
          </div>

          {/* Numbers row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {WHY_GUILDUP_NUMBERS.map((item, i) => (
              <div key={i} className="text-center py-6 rounded-2xl" style={{ backgroundColor: `${primary}06` }}>
                <div
                  className="text-3xl sm:text-4xl font-bold mb-1"
                  style={{
                    backgroundImage: "linear-gradient(to right, hsl(230, 90%, 55%), hsl(215, 100%, 55%))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {item.value}
                </div>
                <p className="text-gray-500 text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_GUILDUP_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-shadow duration-200">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primary}10` }}>
                    <Icon className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ UGC CHECKLIST ━━━ */}
      <section className="py-16 sm:py-20" style={{ background: `linear-gradient(135deg, ${primary}06, ${primary}02)` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                What We Help You Set Up
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The UGC policy outlines clear requirements for student mental health infrastructure. With GuildUp, you can address them from day one.
              </p>
              <button
                onClick={scrollToForm}
                className="px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                style={{ backgroundColor: primary, color: white }}
              >
                Let&apos;s Discuss Your Needs
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                "Mental Health and Well-Being Centre (MHWBC) setup support",
                "Licensed counsellor access for your student body",
                "24/7 campus helpline integrated with Tele-MANAS",
                "Faculty gatekeeper training programme",
                "Student peer-support ambassador programme",
                "Regular screening surveys and self-assessment tools",
                "Awareness campaigns for students, faculty, and parents",
                "Anonymised data collection and MANAS-SETU reporting",
                "On-campus counsellor visits and hybrid delivery model",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#3B47F9]/20 transition-colors duration-200">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primary }} />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden transition-shadow duration-200 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96 pb-5" : "max-h-0"}`}
                >
                  <div className="px-5 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ LEAD FORM CTA ━━━ */}
      <section id="college-lead-form" className="py-16 sm:py-20 bg-gray-50/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Get Started with GuildUp
              </h2>
              <p className="text-gray-600 text-base">
                Share your details and our team will reach out within 24 hours with a customised proposal for your institution.
              </p>
            </div>
            <CollegeLeadForm source="college-landing-bottom" />
          </div>
        </div>
      </section>

      {/* ━━━ FINAL NUDGE ━━━ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: primary }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Your Students Deserve Better Mental Health Support. Let Us Help You Deliver It.
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto text-base leading-relaxed">
            Join the growing number of institutions that are building a genuine culture of well-being on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: white, color: primary }}
            >
              Reach Out to Us
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 border-white/40 text-white hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Schedule a Call
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
