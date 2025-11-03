"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { ProgramKey } from "@/app/programs/config";

interface SymptomsProps {
  programKey: ProgramKey;
}

interface SymptomImage {
  src: string;
  alt: string;
  loaded: boolean;
}

export default function Symptoms({ programKey }: SymptomsProps) {
  const [symptomImages, setSymptomImages] = useState<SymptomImage[]>([]);
  const [hasImages, setHasImages] = useState(false);

  // Supported image extensions to try
  const imageExtensions = ["jpg", "jpeg", "png", "svg", "webp"];
  const maxImages = 10; // Maximum number of symptom images to check

  useEffect(() => {
    // Generate potential image paths based on program slug
    // Pattern: /symptoms/{program-slug}-symptom-{number}.{ext}
    const generateImagePaths = (): SymptomImage[] => {
      const images: SymptomImage[] = [];
      
      for (let i = 1; i <= maxImages; i++) {
        for (const ext of imageExtensions) {
          images.push({
            src: `/symptoms/${programKey}-symptom-${i}.${ext}`,
            alt: `Symptom illustration ${i}`,
            loaded: false,
          });
        }
      }
      
      return images;
    };

    setSymptomImages(generateImagePaths());
  }, [programKey]);

  const handleImageLoad = (src: string) => {
    setSymptomImages((prev) => {
      const updated = prev.map((img) =>
        img.src === src ? { ...img, loaded: true } : img
      );
      return updated;
    });
    setHasImages(true);
  };

  const handleImageError = (src: string) => {
    // Silently handle errors - image doesn't exist
  };

  // Filter to only show loaded images
  const loadedImages = symptomImages.filter((img) => img.loaded);

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Symptoms
        </h2>
        {hasImages && loadedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadedImages.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-[4/3] relative bg-gray-50">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-base text-gray-600 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Symptom images and illustrations will be displayed here
            </p>
            <p className="text-sm text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Add images to <code className="bg-gray-200 px-2 py-1 rounded text-xs">{`public/symptoms/${programKey}-symptom-1.jpg`}</code>
            </p>
            <p className="text-xs text-gray-400 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Supported formats: JPG, PNG, SVG, WebP
            </p>
          </div>
        )}
        {/* Preload images to check for existence */}
        <div className="hidden">
          {symptomImages.map((image, index) => (
            <img
              key={`preload-${index}`}
              src={image.src}
              alt=""
              onLoad={() => handleImageLoad(image.src)}
              onError={() => handleImageError(image.src)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

