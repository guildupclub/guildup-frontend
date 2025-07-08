"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  excerpt: string;
  url: string;
}

export default function ShareButton({ title, excerpt, url }: ShareButtonProps) {
  const handleShare = () => {
    // Add UTM parameters for tracking when copying to clipboard
    const utmParams = new URLSearchParams({
      utm_source: 'share_button',
      utm_medium: 'social',
      utm_campaign: 'blog_share',
      utm_content: 'header_share'
    });
    
    const urlWithUtm = `${url}?${utmParams.toString()}`;

    if (navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: urlWithUtm,
      });
    } else {
      navigator.clipboard.writeText(urlWithUtm);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Share</span>
    </button>
  );
} 