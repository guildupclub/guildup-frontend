export type ProgramKey = "pcos" | "stress-anxiety" | "relationship";

export interface FAQItem {
  question: string;
  answer: string;
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
  approach?: string; // Content for "Our approach" section
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
    about:
      "Polycystic Ovary Syndrome (PCOS) affects millions of women worldwide, impacting hormonal balance, metabolism, and overall well-being. Our PCOS program is designed to address the root causes and symptoms through personalized nutrition guidance, lifestyle modifications, and expert support. We work with you to create a sustainable plan that addresses insulin resistance, hormonal imbalances, and the unique challenges you face with PCOS.",
    approach:
      "Our holistic approach to PCOS management focuses on four key pillars: nutritional optimization to manage insulin resistance, lifestyle modifications for hormonal balance, stress management techniques, and ongoing accountability through regular check-ins with our expert team. We combine evidence-based strategies with personalized guidance to help you regain control of your health and well-being.",
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
    about:
      "Chronic stress and anxiety can significantly impact your daily life, relationships, and overall health. Our Stress & Anxiety program provides comprehensive support to help you understand the root causes of your stress, develop effective coping strategies, and build resilience. Our team of therapists and coaches work together to create a personalized approach that addresses both the psychological and physiological aspects of stress and anxiety.",
    approach:
      "We take a multi-faceted approach to stress and anxiety management, combining cognitive-behavioral techniques, mindfulness practices, breathing exercises, and lifestyle modifications. Our program includes one-on-one therapy sessions, practical tools for daily stress management, and ongoing support to help you build lasting resilience. We focus on empowering you with skills that extend beyond the program, ensuring long-term well-being.",
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
    about:
      "Healthy relationships are fundamental to our happiness and well-being, yet they require skill, understanding, and consistent effort. Our Relationship Program helps individuals and couples navigate challenges, improve communication, resolve conflicts, and build deeper, more meaningful connections. Whether you're looking to strengthen an existing relationship or improve your relationship skills, our expert guidance provides the tools and support you need.",
    approach:
      "Our relationship approach is built on evidence-based methods including emotionally focused therapy, communication training, conflict resolution strategies, and emotional intelligence development. We work with you to identify patterns that may be hindering your relationships, teach effective communication techniques, and help you build stronger emotional connections. Our program supports both individual growth and relationship enhancement, creating lasting positive change.",
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


