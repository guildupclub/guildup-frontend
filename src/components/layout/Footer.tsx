"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
    <footer className="relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-top"
          style={{objectPosition: 'center top'}}
        >
          <source src="/videos/footer.webm" type="video/webm" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="flex justify-end">
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                
                {/* Brand Section */}
                <div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                        GuildUp
                      </h3>
                      <p className="mt-4 text-white/80 leading-relaxed max-w-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Connect with real experts and transform your growth journey through our professional community platform.
                      </p>
                    </div>
                    
                    {/* Newsletter Subscription */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>Stay in the loop</h4>
                      <div className="flex gap-2 max-w-sm">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="flex-1 px-4 py-2.5 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 bg-white/20 backdrop-blur-sm text-white placeholder-white/60"
                          style={{fontFamily: 'Poppins, sans-serif'}}
                        />
                        <button className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl" style={{fontFamily: 'Poppins, sans-serif'}}>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links Grid */}
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                
                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold text-white mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>Platform</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Explore Experts
                      </Link>
                    </li>
                    <li>
                      <Link href="/blogs" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Blogs
                      </Link>
                    </li>
                    <li>
                      <Link href="/" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-semibold text-white mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>Legal</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/terms-conditions" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="font-semibold text-white mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-teal-400 flex-shrink-0" />
                      <Link href="mailto:support@guildup.club" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        support@guildup.club
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-teal-400 flex-shrink-0" />
                      <Link href="tel:+919220521385" className="text-white/70 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        +91 9220521385
                      </Link>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-sm py-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-white/70 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
              © {currentYear} GuildUp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-white/60 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                Terms
              </Link>
              <Link href="/privacy" className="text-white/60 hover:text-teal-400 transition-colors duration-200 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                Privacy
              </Link>
            </div>
          </div>
        </div>
        </div>
      </footer>
    </>
  );
};

export default Footer; 