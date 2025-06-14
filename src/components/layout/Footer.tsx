"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F4F4FB] relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    GuildUp
                  </h3>
                  <p className="mt-4 text-gray-700 leading-relaxed max-w-sm">
                    Connect with real experts and transform your growth journey through our professional community platform.
                  </p>
                </div>
                
                {/* Newsletter Subscription */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Stay in the loop</h4>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                    />
                    <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                
                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        Explore Experts
                      </Link>
                    </li>
                    <li>
                      <Link href="/blogs" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        Blogs
                      </Link>
                    </li>
                    <li>
                      <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/terms-conditions" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <Link href="mailto:support@guildup.club" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        support@guildup.club
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <Link href="tel:+919220521385" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                        +91 9220521385
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-100/50 bg-white/40 backdrop-blur-sm py-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} GuildUp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 