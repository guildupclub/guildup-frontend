export interface Podcast {
  id: string;
  title: string;
  description: string;
  host: string;
  date: string;
  duration: string;
  category: string;
  image: string;
  audioUrl: string;
  listens: number;
  slug: string;
}

export const podcastEpisodes: Podcast[] = [
  {
    id: "1",
    title: "Community Leadership in the Digital Age",
    description: "Join us as we dive deep into what it takes to be an effective community leader in today's fast-paced digital world.",
    host: "Alex Thompson",
    date: "2024-01-14",
    duration: "45 min",
    category: "Community",
    image: "https://picsum.photos/400/250?random=7",
    audioUrl: "#",
    listens: 1250,
    slug: "community-leadership-digital-age"
  },
  {
    id: "2",
    title: "The Psychology of Online Engagement",
    description: "Understanding the psychological factors that drive engagement in online communities and how to leverage them ethically.",
    host: "Dr. Rachel Green",
    date: "2024-01-12",
    duration: "38 min",
    category: "Psychology",
    image: "https://picsum.photos/400/250?random=8",
    audioUrl: "#",
    listens: 980,
    slug: "psychology-online-engagement"
  },
  {
    id: "3",
    title: "Monetizing Your Community: Ethical Strategies",
    description: "Learn sustainable and ethical ways to monetize your community while maintaining trust and providing value to your members.",
    host: "Marcus Williams",
    date: "2024-01-10",
    duration: "52 min",
    category: "Business",
    image: "https://picsum.photos/400/250?random=9",
    audioUrl: "#",
    listens: 1456,
    slug: "monetizing-community-ethical-strategies"
  },
  {
    id: "4",
    title: "Content Creation That Converts",
    description: "Master the art of creating content that not only engages your audience but also drives meaningful action and conversions.",
    host: "Lisa Park",
    date: "2024-01-08",
    duration: "41 min",
    category: "Content",
    image: "https://picsum.photos/400/250?random=10",
    audioUrl: "#",
    listens: 823,
    slug: "content-creation-converts"
  },
  {
    id: "5",
    title: "Building Authentic Relationships Online",
    description: "Explore the nuances of creating genuine connections in digital spaces and building lasting professional relationships.",
    host: "Sarah Mitchell",
    date: "2024-01-06",
    duration: "33 min",
    category: "Networking",
    image: "https://picsum.photos/400/250?random=11",
    audioUrl: "#",
    listens: 742,
    slug: "building-authentic-relationships-online"
  },
  {
    id: "6",
    title: "Personal Branding in the Creator Economy",
    description: "Navigate the creator economy with confidence by building a strong personal brand that resonates with your target audience.",
    host: "David Chen",
    date: "2024-01-04",
    duration: "47 min",
    category: "Branding",
    image: "https://picsum.photos/400/250?random=12",
    audioUrl: "#",
    listens: 1180,
    slug: "personal-branding-creator-economy"
  }
];

export const getPodcastsByCategory = (category: string): Podcast[] => {
  if (category === "All") return podcastEpisodes;
  return podcastEpisodes.filter(podcast => podcast.category === category);
};

export const getPodcastsBySearch = (query: string, category: string): Podcast[] => {
  let filtered = getPodcastsByCategory(category);
  if (query.trim()) {
    const lowercaseQuery = query.toLowerCase();
    filtered = filtered.filter(podcast => 
      podcast.title.toLowerCase().includes(lowercaseQuery) ||
      podcast.description.toLowerCase().includes(lowercaseQuery) ||
      podcast.host.toLowerCase().includes(lowercaseQuery)
    );
  }
  return filtered;
}; 