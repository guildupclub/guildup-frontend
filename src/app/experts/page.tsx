"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";

interface Community {
  _id: string;
  name: string;
  image?: string;
  background_image?: string;
  user_id?: string;
  tags?: string[];
  min_offering_id?: string;
}

export default function ExpertsLandingPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?page=0&limit=24`
        );
        if (res?.data?.r === "s" && Array.isArray(res.data.data)) {
          setCommunities(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch experts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-white/60 px-4 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
            Trusted experts • Private, judgement-free care
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Meet India’s top wellness experts
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-600">
            Book a free discovery call and get matched with a verified specialist for mind, body, and mental wellbeing.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="px-6 sm:px-8 py-3 rounded-lg bg-primary text-primary-foreground shadow hover:opacity-90 transition"
              onClick={() => router.push("/mind")}
            >
              Explore Experts
            </button>
            <button
              className="px-6 sm:px-8 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              onClick={() => window.open("https://wa.me/919220521385?text=Hi! I would like to learn more about GuildUp.", "_blank")}
            >
              Free Discovery Call
            </button>
          </div>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Featured Experts</h2>
            <p className="mt-2 text-gray-600">Handpicked professionals trusted by thousands</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {communities.map((c) => {
                const id = c?._id;
                const cleanedName = (c?.name || "expert")
                  .replace(/\s+/g, "-")
                  .replace(/\|/g, "-")
                  .replace(/-+/g, "-");
                const href = id
                  ? `/community/${encodeURIComponent(cleanedName)}-${id}/profile`
                  : "/community";
                return (
                  <MemoizedCommunityCard
                    key={id}
                    community={c as any}
                    onClick={() => router.push(href)}
                  />
                );
              })}
            </div>
          )}

          {!isLoading && communities.length === 0 && (
            <div className="flex items-center justify-center py-20 text-gray-500">
              No experts found right now. Please check back soon.
            </div>
          )}
        </div>
      </section>

      {/* CTA Band */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-2xl font-semibold">Unsure who to choose?</h3>
              <p className="mt-1 text-primary-foreground/90">Get a personalised recommendation in minutes.</p>
            </div>
            <button
              className="px-6 py-3 rounded-lg bg-white text-primary font-semibold shadow hover:bg-white/90 transition"
              onClick={() => window.open("https://wa.me/919220521385?text=Hi! I would like a recommendation for an expert on GuildUp.", "_blank")}
            >
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


