"use client";
import React from "react";
import type { ProgramKey } from "@/app/programs/config";
import { primary } from "@/app/colours";
import type { FAQItem } from "@/app/programs/config";

type ProgramConfig = {
  slug: ProgramKey;
  title: string;
  subtitle: string;
  description: string;
  aboutTitle?: string;
  about?: string;
};

export default function About({ config }: { config: ProgramConfig }) {
  if (!config) return null;
  
  const title = config.aboutTitle || `What is the ${config.title}?`;
  const content = config.about || config.description;
  
  // Split content by double newlines to create paragraphs, and handle bullet points
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  // Group consecutive bullet points together and handle markdown headers
  const processedContent: Array<{ type: 'text' | 'bullets' | 'h3' | 'h2' | 'hr'; content: string | string[] }> = [];
  let currentBullets: string[] = [];
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (trimmed.startsWith('-')) {
      // It's a bullet point
      currentBullets.push(trimmed.replace(/^-\s*/, ''));
    } else if (trimmed.startsWith('### ')) {
      // It's an h3 header
      if (currentBullets.length > 0) {
        processedContent.push({ type: 'bullets', content: currentBullets });
        currentBullets = [];
      }
      processedContent.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      // It's an h2 header
      if (currentBullets.length > 0) {
        processedContent.push({ type: 'bullets', content: currentBullets });
        currentBullets = [];
      }
      processedContent.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed === '---' || trimmed.match(/^-{3,}$/)) {
      // It's a horizontal rule
      if (currentBullets.length > 0) {
        processedContent.push({ type: 'bullets', content: currentBullets });
        currentBullets = [];
      }
      processedContent.push({ type: 'hr', content: '' });
    } else {
      // It's regular text
      // If we have accumulated bullets, add them first
      if (currentBullets.length > 0) {
        processedContent.push({ type: 'bullets', content: currentBullets });
        currentBullets = [];
      }
      // Handle bold text (**text**)
      const processedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedContent.push({ type: 'text', content: processedText });
    }
  });
  
  // Add any remaining bullets
  if (currentBullets.length > 0) {
    processedContent.push({ type: 'bullets', content: currentBullets });
  }
  
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h2>
        <div className="text-gray-700 space-y-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {processedContent.map((item, index) => {
            if (item.type === 'bullets') {
              return (
                <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                  {(item.content as string[]).map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="text-gray-700">
                      {bullet}
                    </li>
                  ))}
                </ul>
              );
            }
            if (item.type === 'h3') {
              return (
                <h3 key={index} className="text-xl sm:text-2xl font-semibold mt-6 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.content as string}
                </h3>
              );
            }
            if (item.type === 'h2') {
              return (
                <h2 key={index} className="text-2xl sm:text-3xl font-semibold mt-8 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.content as string}
                </h2>
              );
            }
            if (item.type === 'hr') {
              return (
                <hr key={index} className="my-8 border-gray-300" />
              );
            }
            return (
              <p key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.content as string }} />
            );
          })}
        </div>
      </div>
    </section>
  );
}


