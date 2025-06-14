# PostHog Tracking Events Documentation

This document lists all the PostHog tracking events implemented across the GuildUp application for marketing analytics and user behavior tracking.

## 🎯 Critical Conversion Events

### Payment & Booking Events
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `booking_date_selected` | trackClick | BookingDialog | User selects a date for booking |
| `booking_time_slot_selected` | trackClick | BookingDialog | User selects a time slot |
| `confirm_booking_button` | trackClick | BookingDialog | User clicks confirm booking |
| `payment_initiated` | trackClick | BookingDialog | Payment gateway is opened |
| `free_booking_confirmed` | trackUserAction | BookingDialog | Free booking completed successfully |
| `paid_booking_confirmed` | trackUserAction | BookingDialog | Paid booking completed successfully |
| `paid_booking_confirmed_v2` | trackUserAction | BookingDialog | Alternative paid booking confirmation |

### User Registration & Authentication
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `signup_form_submit` | trackClick | SignUp Page | Email signup form submitted |
| `user_registered` | trackUserAction | SignUp Page | User successfully registered |
| `signup_completed` | trackUserAction | SignUp Page | Complete signup flow finished |
| `auto_signin_failed` | trackError | SignUp Page | Auto signin after registration failed |
| `registration_failed` | trackError | SignUp Page | Registration process failed |
| `google_signup_button` | trackClick | SignUp Page | Google signup button clicked |
| `google_signin_button` | trackClick | GoogleSignIn | Google signin button clicked |
| `signin_redirect_from_signup` | trackClick | SignUp Page | Redirect to signin from signup |

### Creator Onboarding
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `creator_signup_button` | trackClick | Home Page | Creator signup button clicked |
| `signup_prompt_shown` | trackUserAction | Home Page | Signin prompt shown to non-authenticated users |
| `creator_form_opened` | trackUserAction | Home Page | Creator form modal opened |
| `signin_from_toast` | trackClick | Home Page | Signin clicked from toast notification |
| `create_guild_button` | trackClick | CreatorForm | Guild creation form submitted |
| `guild_created` | trackUserAction | CreatorForm | Guild successfully created |

## 🏗️ Content Creation Events

### Offering Management
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `create_offering_button` | trackClick | AddOfferingDialog | Create offering button clicked |
| `offering_created` | trackUserAction | AddOfferingDialog | Offering successfully created |
| `add_bank_details_button` | trackClick | AddOfferingDialog | Bank details form submitted |
| `bank_details_added` | trackUserAction | AddOfferingDialog | Bank details successfully added |

### Payment Setup
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `save_bank_details_button` | trackClick | BankDetails | Save bank details button clicked |
| `bank_details_saved` | trackUserAction | BankDetails | Bank details successfully saved |

## 👥 Community Engagement Events

### Social Actions
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `follow_community_button` | trackClick | ProfileCard | Follow community button clicked |
| `unfollow_community_button` | trackClick | ProfileCard | Unfollow community button clicked |
| `share_profile_button` | trackClick | ProfileCard | Share profile button clicked |

### Discovery & Navigation
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `explore_communities_button` | trackClick | Home Page | Explore communities button clicked |
| `category_filter` | trackClick | Home Page | Category filter selected |

### Legal & Compliance
| Event Name | Type | Location | Description |
|------------|------|----------|-------------|
| `terms_link` | trackClick | GoogleSignIn | Terms of use link clicked |
| `privacy_link` | trackClick | GoogleSignIn | Privacy policy link clicked |

## 📊 Event Data Structure

### Common Properties
All events include these common properties when available:
- `user_id`: Current user's ID
- `timestamp`: Event timestamp (automatically added by PostHog)
- `page_url`: Current page URL (automatically added by PostHog)
- `user_agent`: Browser user agent (automatically added by PostHog)

### Booking Events Properties
```typescript
{
  offering_id: string,
  offering_title: string,
  offering_type: 'consultation' | 'webinar',
  offering_price: number,
  offering_currency: string,
  is_free: boolean,
  selected_date: string,
  selected_slot_start: string,
  selected_slot_end: string,
  user_id: string,
  phone_provided?: boolean,
  amount?: number,
  payment_id?: string,
  order_id?: string
}
```

### Community Events Properties
```typescript
{
  community_id: string,
  community_name: string,
  user_id: string,
  source: 'profile_page' | 'search' | 'explore',
  community_member_count?: number,
  share_url?: string,
  share_method?: 'clipboard'
}
```

### User Registration Properties
```typescript
{
  signup_method: 'email' | 'google',
  user_name?: string,
  user_email?: string,
  has_name?: boolean,
  has_email?: boolean,
  has_password?: boolean,
  auto_signin?: boolean,
  error?: string
}
```

### Guild Creation Properties
```typescript
{
  guild_id?: string,
  guild_name: string,
  category_id: string,
  user_id: string,
  has_description: boolean,
  has_tags: boolean,
  has_instagram_followers: boolean,
  has_youtube_subscribers: boolean
}
```

## 🎯 Marketing Funnel Tracking

### Conversion Funnel
1. **Discovery**: `explore_communities_button`, `category_filter`
2. **Interest**: `follow_community_button`, `share_profile_button`
3. **Intent**: `creator_signup_button`, `signup_form_submit`
4. **Action**: `user_registered`, `guild_created`
5. **Revenue**: `create_offering_button`, `confirm_booking_button`, `payment_initiated`
6. **Success**: `offering_created`, `paid_booking_confirmed`

### Key Metrics to Track
- **Conversion Rate**: `creator_signup_button` → `guild_created`
- **Booking Rate**: `confirm_booking_button` → `paid_booking_confirmed`
- **Registration Rate**: `signup_form_submit` → `user_registered`
- **Offering Creation Rate**: `guild_created` → `offering_created`
- **Payment Success Rate**: `payment_initiated` → `paid_booking_confirmed`

## 🔧 Implementation Notes

### Event Types Used
- `trackClick`: For button clicks and user interactions
- `trackUserAction`: For completed actions and state changes
- `trackError`: For error tracking and debugging

### Privacy Compliance
- All events respect cookie consent settings
- Personal data is only tracked when analytics cookies are accepted
- User identification only occurs after explicit consent

### Performance Considerations
- Events are batched and sent asynchronously
- No blocking of user interactions
- Minimal impact on page load times

## 📈 Analytics Dashboard Recommendations

### Key Dashboards to Create
1. **Conversion Funnel**: Track user journey from discovery to payment
2. **Creator Onboarding**: Monitor guild creation and offering setup
3. **Booking Analytics**: Track booking patterns and success rates
4. **Community Engagement**: Monitor follow/unfollow patterns
5. **Error Tracking**: Monitor failed registrations and payments

### Important Cohorts
- **New Users**: Users who registered in the last 30 days
- **Active Creators**: Users who created guilds and offerings
- **Paying Customers**: Users who completed paid bookings
- **Community Leaders**: Users with high follower counts

This tracking implementation provides comprehensive insights into user behavior, conversion patterns, and business metrics for data-driven marketing decisions. 