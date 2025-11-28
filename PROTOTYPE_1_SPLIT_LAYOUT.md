# Prototype 1: 70-30 Split Layout (Left Story, Right Fixed Booking)

## Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (Fixed)                            │
│  "Your Recovery Timeline" | Score: 18/27 | Moderate        │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────┬──────────────────────────────┐
│   LEFT (70% - Scrollable)    │   RIGHT (30% - Fixed)        │
│                              │                              │
│  ┌────────────────────────┐  │  ┌────────────────────────┐  │
│  │ 1. SCORE REVEAL        │  │  │ BOOKING CARD            │  │
│  │                        │  │  │                        │  │
│  │ "Your Score: 18/27"    │  │  │ Name: [Prefilled]      │  │
│  │ "Moderate Symptoms"    │  │  │ Phone: [Prefilled]     │  │
│  │                        │  │  │                        │  │
│  │ [Loading Animation]    │  │  │ Date: [Auto-selected]  │  │
│  │ "Calculating your      │  │  │ Time: [Auto-selected]   │  │
│  │  recovery timeline..." │  │  │                        │  │
│  │                        │  │  │ ┌──────────────────┐  │  │
│  │ "Recovery in: 49 days" │  │  │ │  ₹1,999          │  │  │
│  │                        │  │  │ │  ₹299  [85% OFF] │  │  │
│  │ "Usually takes 6 months│  │  │ └──────────────────┘  │  │
│  │  ❌ Guildup: 49 days  │  │  │                        │  │
│  │  ✅"                   │  │  │ [Book Now - ₹299]     │  │
│  └────────────────────────┘  │  │                        │  │
│                              │  │  "Only 3 slots left"    │  │
│  ┌────────────────────────┐  │  └────────────────────────┘  │
│  │ 2. THE PROBLEM         │  │                              │
│  │                        │  │                              │
│  │ "You've been treating  │  │                              │
│  │  symptoms, not the     │  │                              │
│  │  system"               │  │                              │
│  │                        │  │                              │
│  │ [List of failed        │  │                              │
│  │  approaches]           │  │                              │
│  │                        │  │                              │
│  │ "The truth: It's a     │  │                              │
│  │  nervous system        │  │                              │
│  │  problem"              │  │                              │
│  └────────────────────────┘  │                              │
│                              │                              │
│  ┌────────────────────────┐  │                              │
│  │ 3. THE SOLUTION         │  │                              │
│  │                        │  │                              │
│  │ "The Guildup Framework"│  │                              │
│  │                        │  │                              │
│  │ Step 1: Deep Mind      │  │                              │
│  │  Assessment            │  │                              │
│  │ Step 2: Nervous System │  │                              │
│  │  Reset                 │  │                              │
│  │ Step 3: Cognitive      │  │                              │
│  │  Reframing             │  │                              │
│  │ Step 4: Emotional      │  │                              │
│  │  Release                │  │                              │
│  │ Step 5: Personalized   │  │                              │
│  │  Roadmap               │  │                              │
│  └────────────────────────┘  │                              │
│                              │                              │
│  ┌────────────────────────┐  │                              │
│  │ 4. TESTIMONIALS         │  │                              │
│  │                        │  │                              │
│  │ [3-4 testimonial cards │  │                              │
│  │  in grid layout]        │  │                              │
│  │                        │  │                              │
│  │ "2,500+ people helped"  │  │                              │
│  └────────────────────────┘  │                              │
│                              │                              │
│  ┌────────────────────────┐  │                              │
│  │ 5. URGENCY & CTA        │  │                              │
│  │                        │  │                              │
│  │ "Only 20 spots/month"   │  │                              │
│  │ "3 days left at ₹299"   │  │                              │
│  │                        │  │                              │
│  │ [Secondary CTA Button] │  │                              │
│  └────────────────────────┘  │                              │
└──────────────────────────────┴──────────────────────────────┘
```

## Key Features

### Left Side (70% - Scrollable Story)
1. **Score Reveal Section**
   - Large display: "Your Score: 18/27"
   - Severity badge: "Moderate Symptoms"
   - Loading animation: "Calculating your recovery timeline..."
   - Result: "Recovery in: 49 days"
   - Comparison: "Usually takes 6 months ❌ | Guildup: 49 days ✅"

2. **The Problem Section**
   - Headline: "You've been treating symptoms, not the system"
   - List of failed approaches (therapy, pills, meditation, etc.)
   - Key insight: "It's a nervous system problem"

3. **The Solution Section**
   - "The Guildup Framework" headline
   - 5-step process breakdown
   - Benefits listed

4. **Testimonials Section**
   - Grid of 3-4 testimonial cards
   - Social proof: "2,500+ people helped"
   - From stress-anxiety program page

5. **Urgency & Final CTA**
   - "Only 20 spots/month"
   - Countdown timer
   - Secondary CTA button

### Right Side (30% - Fixed/Sticky)
1. **Booking Card (Always Visible)**
   - Prefilled name and phone
   - Auto-selected date and time slot
   - Price display: ₹1,999 strikethrough, ₹299 highlighted
   - "85% OFF" badge
   - "Book Now - ₹299" button (always visible)
   - "Only 3 slots left" urgency message
   - Sticky positioning (scrolls with page)

## User Flow
1. User completes questionnaire
2. Enters name and phone
3. OTP verification
4. Loading screen: "Analyzing your patterns..."
5. Results page loads with:
   - Left: Story building
   - Right: Ready-to-book card (prefilled)
6. User scrolls left side to read story
7. Right side booking card stays visible
8. One-click booking when ready

## Advantages
- ✅ Booking always visible (no scroll to find it)
- ✅ Story builds case while booking is accessible
- ✅ Prefilled details = faster conversion
- ✅ Single screen = less friction
- ✅ Mobile-friendly (right side becomes bottom on mobile)

## Mobile Adaptation
- Right side becomes sticky bottom bar
- Left side scrolls normally
- Booking card collapses to compact view
- Expandable on tap

