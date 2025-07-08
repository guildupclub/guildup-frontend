"use client";

import { Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title);
  
  // Create URLs with UTM parameters for different social platforms
  const createSocialUrl = (platform: string) => {
    const utmParams = new URLSearchParams({
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: 'blog_share',
      utm_content: 'social_share_button'
    });
    
    return `${url}?${utmParams.toString()}`;
  };



  const handleCopyLink = async () => {
    try {
      // Add UTM parameters for tracking when copying to clipboard
      const utmParams = new URLSearchParams({
        utm_source: 'copy_link',
        utm_medium: 'social',
        utm_campaign: 'blog_share',
        utm_content: 'social_share_section'
      });
      
      const urlWithUtm = `${url}?${utmParams.toString()}`;
      await navigator.clipboard.writeText(urlWithUtm);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleLinkedInShare = async () => {
    try {
      const linkedInUrl = createSocialUrl('linkedin');
      const postText = `Worth reading this article: ${linkedInUrl}`;
      
      // Copy the text to clipboard first
      await navigator.clipboard.writeText(postText);
      
      // Use LinkedIn's shareArticle URL - most reliable for opening share dialog
      const linkedInParams = new URLSearchParams({
        mini: 'true',
        url: linkedInUrl,
        title: title,
        summary: 'Worth reading this article',
        source: 'GuildUp'
      });
      
      const linkedInIntent = `https://www.linkedin.com/shareArticle?${linkedInParams.toString()}`;
      
      // Open LinkedIn in new tab
      window.open(linkedInIntent, '_blank');
      
      // Show success message
      toast.success("LinkedIn opened! Text copied - paste (Ctrl+V) to add your message.");
    } catch (error) {
      // Simple fallback - just open LinkedIn homepage
      try {
        window.open('https://www.linkedin.com', '_blank');
        toast.info("LinkedIn opened! Navigate to create a post and paste your message.");
      } catch (fallbackError) {
        toast.error("Unable to open LinkedIn. Please copy the link manually.");
      }
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
      <div className="flex flex-wrap gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodeURIComponent(createSocialUrl('twitter'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(createSocialUrl('facebook'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>
        <button
          onClick={handleLinkedInShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          Copy Link
        </button>
      </div>
    </div>
  );
} 