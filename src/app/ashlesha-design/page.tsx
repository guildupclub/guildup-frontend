'use client';

import { JSX } from 'react/jsx-runtime';
import OfferingsSection from '../../components/OfferingsSection';

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'Ashlesha helped me find calm in the chaos. Her gentle approach made yoga accessible even as a complete beginner.',
  },
  {
    name: 'Michael K.',
    text: 'The breathing techniques I learned have been life-changing. I sleep better and feel more centered throughout the day.',
  },
  {
    name: 'Priya R.',
    text: 'Such a warm and encouraging teacher. The personalized sessions really made the difference in my practice.',
  },
];

const journeySteps = [
  {
    title: 'Discovery Call',
    duration: '20 min',
    type: 'Video Call',
    price: 'Free',
    description:
      `Get to know each other and explore your wellness starting point. We'll discuss your goals and create a personalized approach together.`,
    button: 'Start Here',
    badgeColor: 'bg-purple-500',
    badgeText: '1',
  },
  {
    title: 'Rise & Shine: Move, Breathe, Unwind',
    duration: '60 min',
    type: 'Video Call',
    price: 'Available Tomorrow',
    description:
      'A special Yoga Day flow to reconnect with your body and breath. Join me this Saturday for a 60-minute session crafted to help you feel grounded, refreshed, and aligned.',
    button: 'Continue Your Practice',
    badgeColor: 'bg-purple-500',
    badgeText: '2',
  },
  {
    title: 'Personalized Wellness Plan',
    duration: 'Ongoing',
    type: 'Personalized',
    price: '',
    description:
      'Build a sustainable yoga and mindfulness practice tailored to your lifestyle. Weekly sessions, progress tracking, and ongoing support for your transformation journey.',
    button: 'Build Your Flow Plan',
    badgeColor: 'bg-purple-500',
    badgeText: '3',
  },
];

export default function AshleshaDesignPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] w-full">
      {/* Everything below the navbar */}
      <div className="max-w-7xl mx-auto pt-10 pb-16 px-8">
        {/* Hero Section (Top Card) */}
        <section className="w-full bg-white rounded-2xl shadow-lg px-0 md:px-8 py-2 flex flex-col md:flex-row items-center md:items-stretch gap-0 md:gap-0 mb-4 border border-gray-100 font-sans min-h-[320px]">
          {/* Left: Profile Image, Name, Title with colored background */}
          <div className="flex flex-col items-center justify-center md:w-1/3 px-0 md:px-8 bg-[#f5f3ff] rounded-l-2xl py-6 h-full">
            {/* Compact Wellness Expert Profile label */}
            <span className="mb-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full px-4 py-1">Wellness Expert Profile</span>
            <span className="mb-2 bg-white border border-green-200 rounded-full px-4 py-1 flex items-center gap-2 shadow text-green-700 text-base font-semibold">
              <span className="text-green-500 text-lg">✔️</span> Verified
            </span>
            <div className="relative flex items-center justify-center mb-4 mt-2">
              <img
                src="https://storage.googleapis.com/v0-bucket/communities/683f18575411ca44bde8f746/profile/8838c4e7-d775-4d3c-97f5-9e99f2d6dddd.jpeg"
                alt="Ashlesha B."
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
              />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900 text-center tracking-tight" style={{textShadow: '0 1px 2px #fff'}}>Ashlesha B.</div>
            <div className="text-base text-gray-600 text-center font-medium mt-1">Certified Yoga & Mindfulness Coach</div>
          </div>
          {/* Right: Info Block */}
          <div className="flex-1 flex flex-col justify-between px-4 md:px-8 py-2 md:py-0 bg-white rounded-r-2xl h-full min-h-[320px] mt-6">
            {/* Top: Community Name and Heading */}
            <div>
              <div className="mb-4 mt-4">
                <span className="inline-block bg-blue-50 text-blue-700 font-semibold text-base rounded-full px-4 py-1">SimpliYoga by Ashlesha</span>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1 leading-tight">&quot;Helping 500+ people reconnect with their breath and body&quot;</div>
              {/* Stats Row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center mb-1 text-sm">
                <div className="flex items-center gap-2 text-gray-700"><span className="text-green-500 text-lg">✔️</span> Verified Expert</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-yellow-500 text-lg">⭐</span> 4.9 from 120+ reviews</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-blue-500 text-lg">🧘</span> 500+ Sessions Conducted</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-pink-500 text-lg">🕒</span> 4+ Years of Experience</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-indigo-500 text-lg">🌐</span> Languages: <span className="font-medium text-gray-800">Hindi, English</span></div>
              </div>
              {/* Availability Badge - moved below stats */}
              <div className="flex items-center gap-2 mb-1 mt-1">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                  <span className="font-bold">Available:</span> Tomorrow · 10:30 AM
                </span>
                <span className="text-xs text-gray-400 ml-2">(Slots updated daily)</span>
              </div>
            </div>
            {/* Bottom: Quote and CTA Button */}
            <div className="flex flex-col gap-2 mt-4 w-full">
              <div className="bg-gray-50 border-l-4 border-purple-300 p-3 rounded-lg text-gray-700 italic flex items-center gap-2 text-sm max-w-xl mb-1">
                <span className="text-purple-400 text-xl">&quot;</span>
                <span>Transformation begins with breath — and someone who gets you.&quot;</span>
              </div>
              <button className="w-full bg-gradient-to-r from-[#5b6dfa] to-[#a084ee] text-white px-6 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow hover:from-blue-700 hover:to-purple-700 transition-colors duration-300">
                <span className="text-xl">💬</span> Begin Your Journey with Ashlesha <span className="text-xl">→</span>
              </button>
              <span className="text-xs text-gray-400 text-center">100% privacy. No spam. No obligation.</span>
            </div>
          </div>
        </section>

        {/* Profile/Discovery Buttons */}
        <div className="flex gap-4 justify-center mb-10">
          <button className="px-6 py-2 rounded-full border border-indigo-500 text-indigo-700 font-semibold bg-white hover:bg-indigo-50 transition-colors duration-200 shadow-sm">Profile</button>
          <button className="px-6 py-2 rounded-full border border-purple-500 text-purple-700 font-semibold bg-white hover:bg-purple-50 transition-colors duration-200 shadow-sm">Discovery</button>
        </div>

        {/* What It&apos;s Like to Work With Me */}
        <section className="bg-white rounded-2xl shadow-lg px-10 pt-8 pb-10 flex flex-col md:flex-row gap-8 items-center mb-10">
          <div className="flex-1">
            <div className="text-2xl font-bold mb-2">What It&apos;s Like to Work With Me</div>
            <div className="text-gray-700 mb-2 leading-relaxed">
              I believe healing happens when you feel truly seen and understood. My approach isn&apos;t about pushing you toward some perfect version of yourself—it&apos;s about meeting you exactly where you are today.<br/><br/>
              Whether you&apos;re carrying stress from a demanding job, navigating life transitions, or simply wanting to reconnect with your body, we&apos;ll create a practice that honors your unique needs and rhythm.<br/><br/>
              My journey from the corporate world to wellness taught me that transformation doesn&apos;t require perfection—it requires compassion, especially for yourself.
            </div>
          </div>
          <div className="flex items-center justify-center md:w-1/3">
            <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center">
              <span className="text-purple-400 text-4xl mb-2">❝❞</span>
              <span className="text-gray-700 text-center italic font-medium">&quot;We&apos;ll start where you are — not where you think you should be.&quot;</span>
            </div>
          </div>
        </section>

        {/* Offerings Section */}
        <OfferingsSection />

        {/* Testimonials */}
        <section className="bg-white rounded-2xl shadow-lg px-10 pt-8 pb-10 mb-10">
          <div className="text-2xl font-bold mb-6">What Others Are Saying</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Example testimonials, replace with your dynamic data if needed */}
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 text-yellow-400 text-lg mb-2">{'★★★★★'}</div>
              <div className="text-gray-700 italic mb-2">&quot;Ashlesha helped me find calm in the chaos. Her gentle approach made yoga accessible even as a complete beginner.&quot;</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">SM</div>
                <div className="text-gray-800 font-semibold text-sm">Sarah M.</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 text-yellow-400 text-lg mb-2">{'★★★★★'}</div>
              <div className="text-gray-700 italic mb-2">&quot;The breathing techniques I learned have been life-changing. I sleep better and feel more centered throughout the day.&quot;</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">MK</div>
                <div className="text-gray-800 font-semibold text-sm">Michael K.</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 text-yellow-400 text-lg mb-2">{'★★★★★'}</div>
              <div className="text-gray-700 italic mb-2">&quot;Such a warm and encouraging teacher. The personalized sessions really made the difference in my practice.&quot;</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">PR</div>
                <div className="text-gray-800 font-semibold text-sm">Priya R.</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 text-yellow-400 text-lg mb-2">{'★★★★★'}</div>
              <div className="text-gray-700 italic mb-2">&quot;I feel more energetic and connected after every session. Highly recommend Ashlesha for anyone seeking clarity and calm.&quot;</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">AR</div>
                <div className="text-gray-800 font-semibold text-sm">Anjali R.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-white rounded-2xl shadow-lg px-10 pt-8 pb-10 mb-10 flex flex-col items-center">
          <div className="text-2xl font-bold mb-2">Still Exploring?</div>
          <div className="text-gray-600 text-center mb-6 max-w-2xl">There&apos;s no rush. Healing and growth happen in your own time. Here are some gentle ways to stay connected while you explore what feels right for you.</div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-purple-400 text-purple-700 font-semibold bg-white hover:bg-purple-50 transition-colors duration-200">
              <span>⭐</span> Follow Ashlesha
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-blue-400 text-blue-700 font-semibold bg-white hover:bg-blue-50 transition-colors duration-200">
              <span>💌</span> Message Her
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-400 text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-colors duration-200">
              <span>🔁</span> See Similar Coaches
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-400 text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-colors duration-200">
              <span>💾</span> Save This Page
            </button>
          </div>
        </section>
      </div>
    </div>
  );
} 