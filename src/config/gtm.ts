export const GTM_CONFIG = {
  // Prefer environment variables; fallback to defaults
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-5ZKZDMMK',
  GA4_ID: process.env.NEXT_PUBLIC_GA4_ID ?? 'G-B3B9W8GRQP',
  FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '661403980198126',
  CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID ?? 'rgpxrvmq3a',
};

// Environment-specific configurations
export const getGTMConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    ...GTM_CONFIG,
    // Add environment-specific settings here if needed
    environment: isProduction ? 'production' : 'development',
  };
};
