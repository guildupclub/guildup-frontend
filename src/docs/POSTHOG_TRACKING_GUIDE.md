# PostHog Tracking Implementation Guide

This guide explains how PostHog tracking has been implemented in your GuildUp application and how to use it effectively.

## 🎯 **What's Already Implemented**

### **Automatic Page Tracking**
✅ **Every page in your app is automatically tracked** when users visit them
✅ **Page performance metrics** (load times, first paint, etc.)
✅ **Scroll depth tracking** (25%, 50%, 75%, 90%, 100%)
✅ **Time on page tracking** (10s, 30s, 1min, 2min, 5min)
✅ **Page exit tracking** with time spent

### **Automatic Data Collection**
- Page URL and title
- Screen resolution and viewport size
- User agent and browser info
- Language and timezone
- Referrer information
- Previous/next page navigation

## 🚀 **How to Use Tracking in Your Components**

### **1. Basic Button Click Tracking**
```tsx
import { useTracking } from '@/hooks/useTracking';

function MyComponent() {
  const { trackClick } = useTracking();
  
  const handleButtonClick = () => {
    trackClick('my_button_name', {
      section: 'header',
      user_type: 'premium'
    });
    // Your button logic here
  };
  
  return <button onClick={handleButtonClick}>Click Me</button>;
}
```

### **2. Form Submission Tracking**
```tsx
const { trackFormSubmit } = useTracking();

const handleSubmit = (formData) => {
  trackFormSubmit('contact_form', {
    form_fields: ['name', 'email', 'message'],
    user_id: currentUser?.id
  });
  // Submit form logic
};
```

### **3. Content Interaction Tracking**
```tsx
const { trackContentInteraction } = useTracking();

const handleLikePost = (postId) => {
  trackContentInteraction('post', 'like', postId, {
    post_author: authorId,
    community_id: communityId
  });
  // Like logic
};
```

### **4. User Action Tracking**
```tsx
const { trackUserAction } = useTracking();

const joinCommunity = (communityId) => {
  trackUserAction('join_community', {
    community_id: communityId,
    community_name: communityName,
    member_count: memberCount
  });
  // Join logic
};
```

### **5. Enhanced Page Tracking for Specific Pages**
```tsx
import { PageTracker } from '@/components/analytics/PageTracker';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      
      <PageTracker 
        pageName="Profile Settings"
        pageCategory="user_management"
        metadata={{
          user_id: userId,
          settings_section: 'privacy',
          is_premium: isPremium
        }}
        trackScrollDepth={true}
        trackTimeOnPage={true}
        trackClicks={true}
      />
    </div>
  );
}
```

## 📊 **Tracking Events Reference**

### **Automatic Events (No Code Required)**
- `$pageview` - Every page visit
- `page_visited` - Enhanced page visit with metadata
- `page_exit` - When user leaves a page
- `page_performance` - Page load performance
- `scroll_depth` - Scroll milestones (25%, 50%, etc.)
- `page_engagement` - User interaction events

### **Manual Events (Use in Your Code)**
- `button_clicked` - Button interactions
- `form_submitted` - Form submissions
- `search_performed` - Search actions
- `content_interaction` - Like, share, comment actions
- `user_action` - Join, create, book, payment actions
- `feature_usage` - Feature start/complete/abandon
- `error_occurred` - Error tracking

## 🔧 **Available Tracking Functions**

```tsx
const {
  trackClick,              // Button clicks
  trackFormSubmit,         // Form submissions
  trackSearch,             // Search actions
  trackNavigation,         // Page navigation
  trackEngagement,         // User engagement
  trackError,              // Errors
  trackCustomEvent,        // Custom events
  trackContentInteraction, // Content interactions
  trackUserAction,         // User actions
  trackFeatureUsage,       // Feature usage
  identifyUser,            // User identification
  isEnabled                // Check if tracking is enabled
} = useTracking();
```

## 🎨 **Quick Implementation Examples**

### **Community Page**
```tsx
// Track joining a community
trackUserAction('join_community', {
  community_id: '12345',
  community_name: 'React Developers',
  member_count: 1250
});

// Track creating a post
trackContentInteraction('post', 'create', postId, {
  community_id: communityId,
  post_type: 'text',
  has_images: false
});
```

### **Booking Page**
```tsx
// Track booking attempt
trackUserAction('book_session', {
  expert_id: expertId,
  expert_name: expertName,
  session_type: 'video_call',
  price: sessionPrice
});

// Track payment completion
trackUserAction('make_payment', {
  amount: paymentAmount,
  currency: 'USD',
  payment_method: 'stripe',
  booking_id: bookingId
});
```

### **Profile Page**
```tsx
// Track profile views
trackCustomEvent('profile_viewed', {
  profile_user_id: profileUserId,
  viewer_user_id: currentUserId,
  relationship: 'stranger' // or 'following', 'follower', etc.
});
```

## 🎯 **Key Pages to Track**

1. **Home Page** ✅ (Already implemented)
2. **Community Pages** - Add community-specific tracking
3. **Profile Pages** - Track profile interactions
4. **Booking Pages** - Track booking funnel
5. **Payment Pages** - Track payment process
6. **Creator Studio** - Track content creation
7. **Search/Feeds** - Track content discovery

## 🔐 **Privacy & Consent**

- ✅ **Respects cookie consent** - Only tracks when analytics cookies are accepted
- ✅ **GDPR compliant** - Users can opt-out anytime
- ✅ **Separate from other tracking** - PostHog data is independent
- ✅ **No PII by default** - Only tracks anonymized user behavior

## 📈 **What You'll See in PostHog Dashboard**

### **Page Analytics**
- Most visited pages
- Page load performance
- User journey flow
- Time spent per page
- Bounce rates

### **User Behavior**
- Button click heatmaps
- Scroll depth analysis
- Feature usage patterns
- Error occurrence rates

### **Business Metrics**
- Community join rates
- Booking conversion funnel
- Payment success rates
- User engagement scores

## 🚀 **Next Steps**

1. **Set up PostHog account** and replace the test key in `.env`
2. **Add tracking to specific pages** using the examples above
3. **Test tracking** by enabling analytics cookies and checking browser console
4. **Monitor PostHog dashboard** for insights

## 📝 **Environment Setup**

Make sure these are set in your `.env` file:
```bash
NEXT_PUBLIC_POSTHOG_KEY=your_actual_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

**🎉 Your app now has comprehensive analytics tracking that respects user privacy and provides valuable insights!** 