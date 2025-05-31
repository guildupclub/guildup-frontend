export interface PodcastEpisode {
  id: number;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  publishDate: string;
  category: string;
  guests: string[];
  tags?: string[];
  featured?: boolean;
}

export const podcastEpisodes: PodcastEpisode[] = [
  {
    id: 1,
    title: "The Future of Mental Health: Expert Panel Discussion",
    description: "Join leading mental health experts as they discuss emerging trends and treatments in mental healthcare.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "45:30",
    publishDate: "2024-01-14",
    category: "mental-health",
    guests: ["Dr. Sarah Wilson", "Dr. Michael Chen"],
    tags: ["mental health", "healthcare", "expert panel"],
    featured: true
  },
  {
    id: 2,
    title: "Leadership Lessons from Top CEOs",
    description: "Insights and strategies from successful business leaders on building and leading high-performing teams.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "38:15",
    publishDate: "2024-01-11",
    category: "leadership",
    guests: ["Mary Johnson", "Tech CEO", "Robert Smith"],
    tags: ["leadership", "business", "management", "CEO"],
    featured: false
  },
  {
    id: 3,
    title: "Productivity Hacks That Actually Work",
    description: "Practical productivity techniques tested by real professionals and proven to boost efficiency.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "32:45",
    publishDate: "2024-01-09",
    category: "productivity",
    guests: ["Dr. Emily Rodriguez", "Productivity Coach"],
    tags: ["productivity", "efficiency", "time management"],
    featured: true
  },
  {
    id: 4,
    title: "Building Healthy Relationships in the Digital Age",
    description: "Exploring how technology impacts relationships and strategies for meaningful connections.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "41:20",
    publishDate: "2024-01-06",
    category: "relationships",
    guests: ["Lisa Martinez", "Digital Wellness Expert"],
    tags: ["relationships", "digital wellness", "technology"],
    featured: false
  },
  {
    id: 5,
    title: "Career Transition Success Stories",
    description: "Real stories from professionals who successfully navigated major career changes and reinvented themselves.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "29:45",
    publishDate: "2024-01-04",
    category: "career",
    guests: ["James Robinson", "Career Coach", "Sarah Kim"],
    tags: ["career change", "success stories", "professional development"],
    featured: false
  },
  {
    id: 6,
    title: "Mindfulness and Stress Management for Busy Professionals",
    description: "Learn practical mindfulness techniques that fit into a busy schedule and help manage workplace stress.",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    duration: "35:15",
    publishDate: "2024-01-02",
    category: "wellness",
    guests: ["Dr. Michael Brown", "Mindfulness Expert"],
    tags: ["mindfulness", "stress management", "wellness", "meditation"],
    featured: true
  }
];

// Helper functions for filtering and managing podcast data
export const getFeaturedPodcasts = (): PodcastEpisode[] => {
  return podcastEpisodes.filter(podcast => podcast.featured);
};

export const getPodcastsByCategory = (category: string): PodcastEpisode[] => {
  if (category === 'all') return podcastEpisodes;
  return podcastEpisodes.filter(podcast => podcast.category === category);
};

export const getLatestPodcasts = (limit: number = 3): PodcastEpisode[] => {
  return podcastEpisodes
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getPodcastById = (id: number): PodcastEpisode | undefined => {
  return podcastEpisodes.find(podcast => podcast.id === id);
};

export const searchPodcasts = (query: string): PodcastEpisode[] => {
  const searchTerm = query.toLowerCase();
  return podcastEpisodes.filter(podcast => 
    podcast.title.toLowerCase().includes(searchTerm) ||
    podcast.description.toLowerCase().includes(searchTerm) ||
    podcast.guests.some(guest => guest.toLowerCase().includes(searchTerm)) ||
    podcast.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}; 