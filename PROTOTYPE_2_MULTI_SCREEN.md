# Prototype 2: Multi-Screen Scrollable with Floating CTA

## Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN 1: HERO REVEAL                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  "Your Assessment Results"                           │  │
│  │                                                       │  │
│  │  [Large Score Display]                               │  │
│  │  "18 out of 27"                                      │  │
│  │  "Moderate Symptoms" [Badge]                         │  │
│  │                                                       │  │
│  │  [Loading Animation]                                 │  │
│  │  "Calculating your personalized recovery timeline..."│  │
│  │                                                       │  │
│  │  "Recovery Timeline: 49 Days"                       │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ "Usually takes 6 months" [Strikethrough]     │    │  │
│  │  │ "Guildup Framework: 49 days" [Highlighted]  │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  [Start Now Button - Large]                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Floating Button: ₹299 - Book Now] (appears after scroll)│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 2: THE PROBLEM                          │
│                                                             │
│  "You've Been Treating Symptoms, Not The System"            │
│                                                             │
│  [Visual: Comparison of old vs new approach]                 │
│                                                             │
│  ❌ Therapy - talks but doesn't change reactions           │
│  ❌ Pills - numb feelings but don't fix root cause         │
│  ❌ Meditation - temporary peace                            │
│  ❌ Self-help - motivation that doesn't last                │
│                                                             │
│  "The Truth: It's a Nervous System Problem"                 │
│                                                             │
│  [CTA Button: See How We Fix This]                         │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 3: THE SOLUTION                         │
│                                                             │
│  "The Guildup Deep Mind Reset Framework"                    │
│                                                             │
│  Step 1: Deep Mind Assessment                               │
│  Step 2: Nervous System Reset                              │
│  Step 3: Cognitive Reframing                               │
│  Step 4: Emotional Release                                 │
│  Step 5: Personalized Roadmap                              │
│                                                             │
│  "What You Get in Your 40-Min Clarity Call:"                │
│  ✓ Root cause analysis                                     │
│  ✓ Personalized recovery roadmap                           │
│  ✓ 30-day support access                                  │
│  ✓ Instant relief techniques                               │
│                                                             │
│  [CTA Button: Book Your Clarity Call]                      │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 4: SOCIAL PROOF                         │
│                                                             │
│  "Hear From Real People"                                    │
│  "2,500+ People Have Reset Their Mind & Nervous System"     │
│                                                             │
│  [Testimonial Grid - 3 cards]                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Testim. 1│  │ Testim. 2│  │ Testim. 3│                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
│  [More testimonials on scroll]                             │
│                                                             │
│  [CTA Button: Join 2,500+ Success Stories]                  │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 5: URGENCY & PRICING                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  "Limited Time Offer"                                │  │
│  │                                                       │  │
│  │  Original: ₹1,999 [Strikethrough]                   │  │
│  │  Today: ₹299 [Large, Highlighted]                    │  │
│  │  "Save 85%" [Badge]                                  │  │
│  │                                                       │  │
│  │  ⏰ "Only 3 days left at this price"                 │  │
│  │  👥 "Only 20 spots available this month"             │  │
│  │                                                       │  │
│  │  [Countdown Timer]                                    │  │
│  │  "3 days : 12 hours : 45 minutes"                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [CTA Button: Secure Your Spot Now - ₹299]                  │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 6: BOOKING FORM                         │
│                                                             │
│  "Book Your 40-Min Clarity Call"                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Name: [Prefilled from earlier]                      │  │
│  │  Phone: [Prefilled, Verified ✓]                      │  │
│  │                                                       │  │
│  │  Select Date: [Calendar with auto-selected]          │  │
│  │  Select Time: [Time slots, auto-selected]            │  │
│  │                                                       │  │
│  │  Order Summary:                                       │  │
│  │  Clarity Call: ₹299                                   │  │
│  │  Total: ₹299                                           │  │
│  │                                                       │  │
│  │  [Pay ₹299 Button - Opens Razorpay]                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              SCREEN 7: GUARANTEE                            │
│                                                             │
│  "100% Risk-Free Guarantee"                                 │
│                                                             │
│  "If you don't gain complete clarity on what's causing     │
│   your anxiety/depression and a clear plan to fix it,      │
│   we'll refund your ₹299 - no questions asked."            │
│                                                             │
│  [Final CTA Button: Start Your Journey - ₹299]              │
│                                                             │
│  [Floating Button: ₹299 - Book Now]                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### Floating CTA Button
- Appears after scrolling past Screen 1
- Fixed position: Bottom-right (desktop) / Bottom-center (mobile)
- Shows: "₹299 - Book Now"
- Always visible, always accessible
- Smooth scroll to booking form on click

### Screen-by-Screen Breakdown

**Screen 1: Hero Reveal**
- Large score display (18/27)
- Severity level badge
- Loading animation for recovery days calculation
- Comparison: 6 months vs 49 days
- Primary CTA: "Start Now"

**Screen 2: The Problem**
- Lists failed approaches
- Explains nervous system problem
- Builds urgency and need

**Screen 3: The Solution**
- 5-step framework explanation
- What they get in clarity call
- Benefits listed

**Screen 4: Social Proof**
- Testimonials grid (3-4 cards visible)
- "2,500+ people helped" stat
- More testimonials on scroll

**Screen 5: Urgency & Pricing**
- Price comparison (₹1,999 → ₹299)
- Countdown timer
- Limited spots messaging
- Multiple urgency signals

**Screen 6: Booking Form**
- Prefilled name and phone
- Auto-selected date and time
- Order summary
- Direct payment button

**Screen 7: Guarantee**
- Risk-free guarantee
- Final reassurance
- Last CTA

## User Flow
1. User completes questionnaire
2. Enters name and phone
3. OTP verification
4. Loading screen
5. **Screen 1**: Score reveal + recovery timeline
6. User scrolls down
7. **Floating button appears** after Screen 1
8. **Screens 2-7**: Story building with repeated CTAs
9. User can click floating button anytime OR scroll to booking
10. **Screen 6**: Booking form (prefilled)
11. One-click payment

## Advantages
- ✅ Multiple touchpoints for conversion
- ✅ Story builds progressively
- ✅ Floating CTA = always accessible
- ✅ Repeated urgency signals
- ✅ More space for testimonials and social proof
- ✅ Can optimize each screen independently

## Mobile Adaptation
- Floating button: Bottom-center, full width
- Each screen: Full viewport height
- Smooth scroll between screens
- Swipe gestures for navigation (optional)

## Conversion Optimization Elements
- **Urgency**: Countdown timer, limited spots
- **Social Proof**: 2,500+ testimonials
- **Scarcity**: "Only 20 spots/month"
- **Risk Reversal**: Money-back guarantee
- **Price Anchoring**: ₹1,999 → ₹299
- **Multiple CTAs**: Every screen + floating button
- **Prefilled Forms**: Reduce friction

