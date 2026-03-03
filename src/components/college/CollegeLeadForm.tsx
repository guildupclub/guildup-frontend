"use client";

import React, { useState } from "react";
import { primary, white } from "@/app/colours";
import { saveInquiry } from "@/lib/services/diagnosticLeads";
import { toast } from "sonner";
import { saveCollegeLeadToGoogleSheets } from "@/app/wellness-check/utils/googleSheets";

interface CollegeLeadFormProps {
  variant?: "inline" | "modal";
  source?: string;
}

const STUDENT_COUNT_OPTIONS = [
  "Less than 500",
  "500 - 1,000",
  "1,000 - 3,000",
  "3,000 - 5,000",
  "5,000 - 10,000",
  "10,000+",
];

export default function CollegeLeadForm({ variant = "inline", source = "college-landing" }: CollegeLeadFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [role, setRole] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      // 1) Save into your existing inquiry backend
      try {
        await saveInquiry({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          concerns: `[College Programme] Institution: ${institutionName} | Role: ${role} | Students: ${studentCount} | ${message}`.trim(),
        });
      } catch (err) {
        console.error("Failed to save to inquiry collection:", err);
      }

      // 2) Fire-and-forget save to Google Sheets + email via Apps Script
      saveCollegeLeadToGoogleSheets({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        institutionName: institutionName.trim(),
        role: role.trim(),
        studentCount,
        message: message.trim(),
        source,
        timestamp: new Date().toISOString(),
      }).catch((err) => {
        console.error("Failed to send college lead to Google Sheets:", err);
      });

      // 3) Success UI
      setSubmitted(true);
      toast.success("Thank you! Our team will reach out within 24 hours.");
      setName("");
      setEmail("");
      setPhone("");
      setInstitutionName("");
      setRole("");
      setStudentCount("");
      setMessage("");
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primary}15` }}>
          <svg className="w-8 h-8" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">We have received your request</h3>
        <p className="text-gray-600">Our team will get in touch with you within 24 hours to discuss how GuildUp can support your institution.</p>
      </div>
    );
  }

  const inputClasses = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3B47F9] focus:ring-1 focus:ring-[#3B47F9]/30 transition-all duration-200 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Your full name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder="Work email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Phone number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          placeholder="Institution name *"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          placeholder="Your role / designation"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClasses}
        />
        <select
          value={studentCount}
          onChange={(e) => setStudentCount(e.target.value)}
          className={`${inputClasses} ${!studentCount ? "text-gray-400" : "text-gray-900"}`}
        >
          <option value="" disabled>Approx. student count</option>
          {STUDENT_COUNT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Any specific requirements or questions?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={`${inputClasses} min-h-[80px] resize-none`}
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: primary,
          color: white,
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Submitting..." : "Request a Callback"}
      </button>
      <p className="text-xs text-gray-400 text-center">We respect your privacy. Your information will never be shared with third parties.</p>
    </form>
  );
}
