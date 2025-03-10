"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { StringConstants } from "../common/CommonText";

export default function CreatorStudio() {
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for joining!", {
        description: "We'll notify you when we launch.",
      });
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4 py-24">
      <div className="max-w-5xl w-full mx-auto text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            {StringConstants.CREATOR_STUDIO}
            <span className="text-primary ml-2">{StringConstants.COMMING_SOON}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your all-in-one platform to create, collaborate, and monetize your
            content. Join the waitlist to be the first to know when we launch.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
          <CountdownCard value={timeLeft.days} label="Days" />
          <CountdownCard value={timeLeft.hours} label="Hours" />
          <CountdownCard value={timeLeft.minutes} label="Minutes" />
          <CountdownCard value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Simple Email Input */}
        <Card className="max-w-md mx-auto border-primary/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 text-accent"
              />
              <Button type="submit">Notify Me</Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        {/* <div className="py-12">
          <h2 className="text-2xl font-bold mb-8">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Camera className="h-8 w-8 text-primary" />}
              title="Professional Tools"
              description="Access to professional-grade creation tools for photos, videos, and more."
            />
            <FeatureCard
              icon={<Paintbrush className="h-8 w-8 text-primary" />}
              title="Creative Templates"
              description="Hundreds of templates to jumpstart your creative projects."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="AI Assistance"
              description="AI-powered tools to enhance your content creation workflow."
            />
            <FeatureCard
              icon={<Music className="h-8 w-8 text-primary" />}
              title="Monetization"
              description="Multiple ways to monetize your content and grow your audience."
            />
          </div>
        </div> */}

        {/* <Separator className="my-8" /> */}

        {/* Social Media
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Follow Our Journey</h3>
          <div className="flex justify-center space-x-4">
            <SocialButton
              icon={<Instagram className="h-5 w-5" />}
              href="https://instagram.com"
            />
            <SocialButton
              icon={<Twitter className="h-5 w-5" />}
              href="https://twitter.com"
            />
            <SocialButton
              icon={<Youtube className="h-5 w-5" />}
              href="https://youtube.com"
            />
            <SocialButton
              icon={<Facebook className="h-5 w-5" />}
              href="https://facebook.com"
            />
          </div>
        </div>

        <footer className="mt-12 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Creator Studio. All rights reserved.
        </footer> */}
      </div>
    </div>
  );
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-card rounded-lg p-4 flex flex-col items-center justify-center border border-primary/10 shadow-lg">
      <span className="text-3xl md:text-4xl font-bold text-primary">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-lg p-6 border border-primary/10 flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all">
      {icon}
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => window.open(href, "_blank")}
    >
      {icon}
    </Button>
  );
}
