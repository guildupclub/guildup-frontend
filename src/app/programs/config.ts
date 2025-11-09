export type ProgramKey = "pcos" | "stress-anxiety" | "relationship";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ApproachItem {
  title: string;
  description: string;
}

interface ProgramConfig {
  slug: ProgramKey;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ogImage?: string;
  heroSvg?: string;
  about?: string; // Longer description for "What is the Program about" section
  aboutTitle?: string; // Custom title for about section
  approach?: string; // Content for "Our approach" section
  approachTitle?: string; // Custom title for approach section
  approachItems?: ApproachItem[]; // Detailed approach items with titles and descriptions
  outcomes?: string; // Content for "In Just X Days" section
  faqs?: FAQItem[]; // Frequently asked questions
}

export const PROGRAMS: Record<ProgramKey, ProgramConfig> = {
  pcos: {
    slug: "pcos",
    tag: "pcos",
    title: "PCOS Program",
    subtitle: "Beat PCOS with expert guidance and a personalized plan",
    description:
      "Overcome PCOS challenges through structured support: expert consults, a tailored roadmap, and ongoing accountability.",
    ogImage: "/public/hero/hero1.jpg",
    aboutTitle: "The Truth About PCOD and PCOS",
    about:
      "PCOD and PCOS aren't just physical conditions, They're an entire ecosystem of imbalance.\n\nWhen your hormones go off-track, so does everything else:\n\n- Weight fluctuates without reason\n\n- Sleep becomes restless\n\n- Anxiety creeps in\n\n- Relationships strain\n\n- You lose trust in your own body\n\nBut the truth is, your body isn't against you. It's asking for alignment, not punishment.",
    approach:
      "We don't offer temporary fixes. We guide you through a holistic system of healing, built to bring balance back to your body and mind.",
    approachItems: [
      {
        title: "Personalized Healing Plans",
        description: "Every body is unique. Our experts design a plan that matches your symptoms, routine, and lifestyle."
      },
      {
        title: "Mind-Body Sync Sessions",
        description: "Guided meditations, breathwork, and relaxation techniques help reduce cortisol, the stress hormone that silently triggers hormonal chaos."
      },
      {
        title: "Cycle-Syncing & Habit Tracking",
        description: "Learn how to align your lifestyle with your natural rhythm. We help you understand each phase of your menstrual cycle and build habits that support your energy, focus, and wellbeing."
      }
    ],
    outcomes:
      "In Just 60 Days\n\nYou'll begin to feel your body finding its balance again.\n\nThe fog will lift, your energy will rise, and the little things that once felt heavy will start to feel lighter.\n\nYour cycles will begin to stabilize, your mind will calm, and you'll start feeling connected to your body not at war with it.\n\nThis isn't a quick fix. It's the beginning of healing.",
    faqs: [
      {
        question: "What is PCOS and how does your program help?",
        answer:
          "Polycystic Ovary Syndrome (PCOS) is a hormonal disorder affecting women of reproductive age. Our program addresses PCOS through personalized nutrition plans to manage insulin resistance, lifestyle modifications for hormonal balance, stress management techniques, and regular check-ins with our expert team to ensure progress and accountability.",
      },
      {
        question: "How long does the PCOS program take?",
        answer:
          "The PCOS program is designed to be flexible based on your individual needs. Typically, we recommend a minimum of 3 months to see meaningful changes, but the program can extend longer depending on your goals and progress. Our expert team will work with you to create a timeline that's sustainable and effective.",
      },
      {
        question: "Do I need any medical clearance before starting?",
        answer:
          "While our program focuses on lifestyle and nutrition, we recommend consulting with your healthcare provider before making significant dietary or lifestyle changes, especially if you have existing medical conditions or are taking medications. Our experts can work alongside your medical team to create a comprehensive approach.",
      },
      {
        question: "What kind of support will I receive during the program?",
        answer:
          "You'll receive regular one-on-one consultations with our PCOS experts, personalized nutrition guidance, lifestyle modification strategies, and ongoing accountability through check-ins. Our team is available to answer questions, provide support, and adjust your plan as needed throughout your journey.",
      },
      {
        question: "Can I follow the program if I have other health conditions?",
        answer:
          "Yes, our program is designed to be adaptable. Our experts will take into account any existing health conditions and work with you to create a plan that addresses PCOS while considering your other health needs. We always recommend coordinating with your healthcare providers for a comprehensive approach.",
      },
    ],
  },
  "stress-anxiety": {
    slug: "stress-anxiety",
    tag: "stress-anxiety",
    title: "Stress & Anxiety Program",
    subtitle: "Build calm, resilience, and mental clarity",
    description:
      "Reduce stress and anxiety with top coaches and therapists through a guided, step-by-step plan and support.",
    ogImage: "/public/hero/hero2.jpg",
    aboutTitle: "STRESS & ANXIETY",
    about:
      "### You've been strong for too long, haven't you?\n\nYou tell everyone you're fine. You smile when you need to. You keep showing up : for work, for people, for life. But when it's quiet, and there's no one left to perform for, you can feel it. That tightness in your chest. The weight sitting in your stomach. The exhaustion that sleep doesn't fix.\n\nYou've forgotten what it's like to feel at ease. To wake up without dread. To fall asleep without replaying the day. To breathe without that invisible pressure on your chest.\n\nSomewhere along the way, \"doing your best\" turned into \"barely holding on.\"\n\nAnd no one noticed because you hide it so well.\n\nAt **GuildUp**, we do.\n\nWe notice. We understand that what you're carrying isn't weakness, it's weariness. The kind that comes from giving too much, feeling too much, thinking too much, for too long.\n\nWe're here to help you find your way\n\n## What's Really Happening Inside You\n\nStress and anxiety don't just live in your mind. They live in your body  in the racing heartbeat, the shallow breath, the sleepless nights that never seem to end.\n\nYour body isn't failing you; it's protecting you. The tension, the panic, the exhaustion : they're all signals that you've been in survival mode for too long.\n\nYou've simply forgotten what safety feels like. But healing is possible. You can teach your body to exhale again, to rest, and to move through life without fear constantly following behind.",
    approach:
      "We don't promise instant calm. We promise real change, the kind that comes from understanding, not avoiding.",
    approachItems: [
      {
        title: "Mind-Body Reset",
        description: "We guide you through gentle yet powerful breathwork, meditation, and grounding practices designed to help your body release what it's been holding for too long. You'll begin to notice how your thoughts slow down as your body learns to feel safe again."
      },
      {
        title: "Emotional Unblocking",
        description: "Anxiety often hides what's really hurting underneath : fear, grief, guilt, or pressure to be enough. Through guided reflection and emotional processing sessions, we help you face what you've buried, understand it with compassion, and let it go piece by piece."
      },
      {
        title: "Rebuilding Inner Balance",
        description: "We help you create calm from the ground up. Through lifestyle shifts, mindful routines, and mental rewiring, you'll learn how to carry peace into your daily life even when things get chaotic. You won't just manage stress. You'll change your relationship with it."
      }
    ],
    outcomes:
      "### In Just 60 Days\n\nYou'll begin to feel your body exhale again.\n\nYour thoughts will start to slow down. The chaos will soften. The heaviness will lift.\n\nAnd for the first time in a long time, peace will begin to feel possible again.\n\nThis isn't a promise of perfection. It's a promise of progress ; real, visible, and lasting.",
    faqs: [
      {
        question: "How can therapy help with stress and anxiety?",
        answer:
          "Therapy provides a safe space to explore the root causes of your stress and anxiety, learn effective coping strategies, and develop skills to manage symptoms. Our therapists use evidence-based techniques like CBT (Cognitive Behavioral Therapy) and mindfulness to help you build resilience and regain control over your mental well-being.",
      },
      {
        question: "How long will it take to see results?",
        answer:
          "Results vary for each individual, but many people start noticing improvements within a few weeks of consistent practice. Significant progress typically occurs over 8-12 weeks of regular sessions and applying the techniques learned. Our program is designed to provide both immediate relief tools and long-term sustainable strategies.",
      },
      {
        question: "Do I need a diagnosis to join the program?",
        answer:
          "No, you don't need a formal diagnosis. If you're experiencing stress, anxiety, or related symptoms that impact your daily life, our program can help. However, if you have severe symptoms or a diagnosed condition, we recommend coordinating with your healthcare provider alongside our program.",
      },
      {
        question: "What happens in a therapy session?",
        answer:
          "Therapy sessions are personalized to your needs. Typically, you'll discuss your current challenges, explore patterns and triggers, learn practical coping strategies, and work on applying new skills in your daily life. Our therapists create a supportive, non-judgmental environment where you can freely express yourself and work toward your goals.",
      },
      {
        question: "Is the program confidential?",
        answer:
          "Yes, absolutely. All therapy sessions and communications are strictly confidential, following professional ethical guidelines and privacy regulations. Your information is protected and only shared with your explicit consent or in situations required by law.",
      },
    ],
  },
  relationship: {
    slug: "relationship",
    tag: "relationship",
    title: "Relationship Program",
    subtitle: "Strengthen your relationships with expert-backed strategies",
    description:
      "Improve communication, resolve conflicts, and build deeper connections with end-to-end expert support.",
    ogImage: "/public/hero/hero3.jpg",
    aboutTitle: "RELATIONSHIPS",
    about:
      "### You love deeply, but lately, it's been heavy, hasn't it?\n\nYou care, you try, you give, but somehow, it still hurts.\n\nYou overthink every word, every pause, every silence.\n\nYou replay moments in your head, wondering if you said too much, or maybe not enough.\n\nYou crave connection but you're scared of being misunderstood.\n\nYou want love but you're tired of the patterns, the same arguments, the same distance, the same ache of feeling unseen.\n\nSometimes it's not even about another person.\n\nIt's about how you've started losing yourself while trying to keep things together.\n\nAt **GuildUp**, we know relationships can both heal and hurt.\n\nBut we also know they can transform when you start healing from within.\n\n---\n\n## What's Really Happening Inside You\n\nWhen relationships become strained, it's not just about miscommunication. It's about disconnection.\n\nYou disconnect from your emotions, from your needs, and sometimes, from yourself.\n\nYou stop expressing to keep the peace. You start carrying what's not yours just to hold things together. You tell yourself you're okay even when something deep inside you knows you're not.\n\nThis constant emotional push and pull keeps your nervous system in overdrive. You're not broken for feeling too much. You've just been living in survival mode, even in love.\n\nBut it doesn't have to stay that way.\n\nYou can love without losing balance. You can be vulnerable without fear. You can rebuild connection starting with yourself.",
    approachTitle: "How GuildUp Helps You Heal",
    approach:
      "We help you rebuild relationships not by changing others, but by returning you to yourself.",
    approachItems: [
      {
        title: "Inner Healing and Awareness",
        description: "We help you understand the emotional patterns that shape your relationships, where they come from, how they repeat, and how to break them gently. You'll begin to see how past hurt shows up in present love and how awareness becomes the first step toward change."
      },
      {
        title: "Communication and Boundaries",
        description: "You'll learn how to express yourself without guilt, listen without reacting, and set boundaries that protect your peace instead of building walls. We'll help you create safety both in how you speak and in how you're heard."
      },
      {
        title: "Reconnecting with Love",
        description: "Through guided reflections and mindful exercises, you'll rediscover what love feels like when it's not tied to fear or expectation. You'll learn to give from fullness, not emptiness, to connect without losing yourself."
      }
    ],
    outcomes:
      "### In Just 60 Days\n\nYou'll begin to see your relationships differently : softer, calmer, more honest.\n\nYou'll start setting boundaries without guilt, speaking your truth without fear, and loving without losing yourself.\n\nIn 60 days, the tension will begin to loosen.\n\nYou'll start to recognize peace where there used to be pressure.",
    faqs: [
      {
        question: "Can I join alone, or do I need my partner?",
        answer:
          "You can join our program either individually or with your partner. Individual participation allows you to work on your own relationship skills, communication patterns, and personal growth. Couple sessions provide a space for both partners to learn and practice together, improving their dynamic as a team.",
      },
      {
        question: "What if my partner is not interested in joining?",
        answer:
          "Many people find significant improvement working individually on relationship skills. You can learn communication techniques, understand relationship patterns, and develop emotional intelligence that will positively impact your relationships, even if your partner doesn't participate initially.",
      },
      {
        question: "How long does relationship counseling typically take?",
        answer:
          "The duration varies based on your specific goals and challenges. Some couples see meaningful progress in 8-12 weeks, while others may benefit from longer-term support. We work with you to create a plan that fits your needs and timeline, with regular check-ins to assess progress.",
      },
      {
        question: "What topics are covered in the relationship program?",
        answer:
          "Our program covers communication skills, conflict resolution, emotional intelligence, understanding relationship patterns, building trust and intimacy, managing differences, and creating shared goals. The specific focus areas are tailored to your unique situation and needs.",
      },
      {
        question: "Is relationship counseling only for couples in crisis?",
        answer:
          "Not at all! Relationship counseling is valuable at any stage of a relationship. Whether you're looking to strengthen a healthy relationship, resolve ongoing conflicts, or prepare for major life transitions, our program provides tools and strategies to help you build stronger, more fulfilling connections.",
      },
    ],
  },
};

export function getProgramConfig(slug: string): ProgramConfig | null {
  return PROGRAMS[slug as ProgramKey] || null;
}


