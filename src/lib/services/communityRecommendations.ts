export interface Community {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  owner_experience: number;
  owner_sessions: number;
  num_member: number;
  owner_name: string;
  linkedin_followers: number;
  youtube_followers: number;
  instagram_followers: number;
}

export interface CommunityWithOffering {
  community: Community;
  offerings: Array<{
    _id: string;
    title: string;
    description: string;
    type: string;
    price: {
      amount: number;
      currency: string;
    };
  }>;
}

// Mock data for now - in production, this would be fetched from an API
const mockCommunities: CommunityWithOffering[] = [
  {
    community: {
      _id: "685bcf2d76aa736a1c6853fe",
      name: "Khushi Tayal",
      description: "Hi, I'm Khushi Tayal, a counselling psychologist with a deep curiosity for people and the stories they carry. With a Master's in Counselling Psychology and a soft spot for stories that heal, I blend science with soul to create safe spaces for people to just... be.",
      image: "https://storage.googleapis.com/v0-bucket/communities/685bcf2d76aa736a1c6853fe/profile/a1fff12e-dda3-4bf1-9b16-4038dc63201a.jpg",
      tags: ["Anxiety", "Trauma", "Stress", "Overthinking", "Therapy", "Relationship Issues", "Mental health"],
      owner_experience: 3,
      owner_sessions: 50,
      num_member: 9,
      owner_name: "Khushi Tayal",
      linkedin_followers: 1062,
      youtube_followers: 0,
      instagram_followers: 0
    },
    offerings: [
      {
        _id: "686f63c660c4b417811ee134",
        title: "Therapy",
        description: "Individual therapy sessions for mental health support",
        type: "consultation",
        price: { amount: 600, currency: "INR" }
      }
    ]
  },
  {
    community: {
      _id: "685bcf2d76aa736a1c6853ff",
      name: "Dr. Sarah Johnson",
      description: "Licensed clinical psychologist specializing in anxiety and depression treatment with 8+ years of experience.",
      image: "/experts/sarah.jpg",
      tags: ["Depression", "Anxiety", "Cognitive Behavioral Therapy", "Mental Health"],
      owner_experience: 8,
      owner_sessions: 200,
      num_member: 15,
      owner_name: "Dr. Sarah Johnson",
      linkedin_followers: 2500,
      youtube_followers: 500,
      instagram_followers: 1200
    },
    offerings: [
      {
        _id: "686f63c660c4b417811ee135",
        title: "CBT Therapy",
        description: "Cognitive Behavioral Therapy sessions",
        type: "consultation",
        price: { amount: 800, currency: "INR" }
      }
    ]
  },
  {
    community: {
      _id: "685bcf2d76aa736a1c685400",
      name: "Michael Chen",
      description: "Mental health counselor and life coach with expertise in stress management and personal development.",
      image: "/experts/michael.jpg",
      tags: ["Stress Management", "Life Coaching", "Personal Development", "Mindfulness"],
      owner_experience: 5,
      owner_sessions: 120,
      num_member: 8,
      owner_name: "Michael Chen",
      linkedin_followers: 1800,
      youtube_followers: 300,
      instagram_followers: 800
    },
    offerings: [
      {
        _id: "686f63c660c4b417811ee136",
        title: "Life Coaching",
        description: "Personal development and life coaching sessions",
        type: "consultation",
        price: { amount: 500, currency: "INR" }
      }
    ]
  }
];

export function getCommunityRecommendations(
  severity: string,
  suicidality: boolean,
  labels: string[],
  topN: number = 3
): CommunityWithOffering[] {
  const communities = mockCommunities;
  
  // Filter communities based on severity and suicidality
  const filteredCommunities = communities.filter(item => {
    const community = item.community;
    
    // Skip if no offerings
    if (!item.offerings || item.offerings.length === 0) return false;
    
    // Filter based on severity
    if (severity.toLowerCase().includes('severe')) {
      // For severe cases, prioritize experienced therapists
      return community.owner_experience >= 2 || community.owner_sessions >= 10;
    } else if (severity.toLowerCase().includes('moderate')) {
      // For moderate cases, include experienced and some newer therapists
      return community.owner_experience >= 1 || community.owner_sessions >= 5;
    }
    
    // For mild/minimal cases, include all communities
    return true;
  });

  // Score and rank communities
  const scoredCommunities = filteredCommunities.map(item => {
    const community = item.community;
    let score = 0;
    
    // Base score from experience and sessions
    score += community.owner_experience * 10;
    score += community.owner_sessions * 5;
    score += community.num_member * 2;
    
    // Social proof scoring
    score += community.linkedin_followers * 0.1;
    score += community.youtube_followers * 0.1;
    score += community.instagram_followers * 0.1;
    
    // Tag matching for mental health related tags
    const mentalHealthTags = ['anxiety', 'depression', 'therapy', 'mental health', 'stress', 'trauma', 'counseling'];
    const communityTags = community.tags.map(tag => tag.toLowerCase());
    const matchingTags = mentalHealthTags.filter(tag => 
      communityTags.some(ctag => ctag.includes(tag))
    );
    score += matchingTags.length * 15;
    
    // Suicidality risk - prioritize experienced therapists
    if (suicidality) {
      if (community.owner_experience >= 3) score += 50;
      else if (community.owner_experience >= 2) score += 30;
      else score += 10;
    }
    
    // Severity-based scoring
    if (severity.toLowerCase().includes('severe')) {
      score += community.owner_experience * 20;
    } else if (severity.toLowerCase().includes('moderate')) {
      score += community.owner_experience * 10;
    }
    
    return {
      ...item,
      score,
      matchPercent: Math.min(95, Math.max(60, Math.round(60 + (score / 10))))
    };
  });

  // Sort by score and return top N
  return scoredCommunities
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(item => ({
      community: item.community,
      offerings: item.offerings,
      matchPercent: item.matchPercent
    }));
}

export function getCommunityProfileUrl(communityId: string): string {
  return `/community/${communityId}`;
}
