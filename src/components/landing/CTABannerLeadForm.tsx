"use client";
import React from "react";
import { primary, white } from "@/app/colours";
import LeadFormModal from "@/components/programs/LeadFormModal";

const CTABannerLeadForm: React.FC = () => {
  return (
    <section className="py-16" style={{ backgroundColor: primary }} aria-labelledby="cta-leadform-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="cta-leadform-title" className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: white, fontFamily: "'Poppins', sans-serif" }}>
          Get a personalized plan
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Tell us your goals and we&apos;ll match you with the right expert.
        </p>
        <LeadFormModal program="general" triggerLabel="Get Information" variant="primary" appearance="white" />
      </div>
    </section>
  );
};

export default CTABannerLeadForm;


