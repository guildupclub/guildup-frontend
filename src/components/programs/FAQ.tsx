"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FAQ({ faqs, title = "Frequently Asked Questions" }: FAQProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {title}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
              <AccordionTrigger
                className="text-left py-4 hover:no-underline"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="font-semibold text-base sm:text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <p
                  className="text-base leading-relaxed"
                  style={{ fontFamily: "'Poppins', sans-serif", color: "#334155" }}
                >
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

