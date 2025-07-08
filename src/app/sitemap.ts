import { MetadataRoute } from 'next'
import { getAllBlogPostsMetadata } from '@/lib/blog'

// Define the Community interface
interface Community {
  _id: string;
  name: string;
  user_id: string;
  description?: string;
  imageUrl?: string;
}

// Function to fetch all communities for sitemap
async function getAllCommunities(): Promise<Community[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!baseUrl) {
    console.warn('Backend URL not configured, skipping community sitemap generation');
    return [];
  }

  try {
    // Fetch all communities in batches
    const allCommunities: Community[] = [];
    let page = 0;
    const limit = 100; // Fetch more per page for sitemap
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${baseUrl}/v1/community/all?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add cache options for build-time generation
          next: { revalidate: 3600 }, // Revalidate every hour
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch communities: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      if (data.r === 's' && Array.isArray(data.data)) {
        allCommunities.push(...data.data);
        
        // Check if we have more pages
        const meta = data.meta;
        if (meta && meta.total) {
          hasMore = (page + 1) * limit < meta.total;
        } else {
          // Fallback: if we got less than limit, assume no more pages
          hasMore = data.data.length === limit;
        }
        
        page++;
      } else {
        console.error('Invalid community response format:', data);
        break;
      }
    }

    console.log(`Fetched ${allCommunities.length} communities for sitemap`);
    return allCommunities;
  } catch (error) {
    console.error('Error fetching communities for sitemap:', error);
    return [];
  }
}

// Function to create SEO-friendly URL slug from community name
function createCommunitySlug(community: Community): string {
  // Handle cases where community name might be undefined or empty
  const name = community.name || `community-${community._id}`;
  
  const cleanedName = name
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/\|/g, "-")            // Replace pipes with hyphens
    .replace(/[^a-zA-Z0-9-]/g, "")  // Remove special characters except hyphens
    .replace(/-+/g, "-")            // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "")        // Remove leading/trailing hyphens
    .toLowerCase() || "community";   // Convert to lowercase with fallback
  
  return `${cleanedName}-${community._id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.guildup.club'
  
  try {
    // Get all blog posts and communities in parallel
    const [blogPosts, communities] = await Promise.all([
      getAllBlogPostsMetadata(),
      getAllCommunities()
    ]);

    // Static pages with proper priorities
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/community`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/community/feed`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/profile`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/booking`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/feeds`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact-us`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/creator-studio`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms-conditions`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ];

    // Blog post pages with proper priorities
    const blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.8 : 0.6,
    }));

    // Expert/Community profile pages with high priority for SEO
    // Filter out invalid communities and create URLs
    const validCommunities = communities.filter(community => 
      community && community._id && (community.name || community._id)
    );
    
    console.log(`Generating URLs for ${validCommunities.length} valid communities out of ${communities.length} total`);
    
    const expertPages = validCommunities.map((community) => {
      try {
        const communitySlug = createCommunitySlug(community);
        
        return [
          // Main profile page (highest priority for experts)
          {
            url: `${baseUrl}/community/${communitySlug}/profile`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9, // High priority for expert profiles
          },
          // Community feed page
          {
            url: `${baseUrl}/community/${communitySlug}/feed`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
          // Community events page
          {
            url: `${baseUrl}/community/${communitySlug}/event`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          },
          // Community members page
          {
            url: `${baseUrl}/community/${communitySlug}/members`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          },
          // Community announcements page
          {
            url: `${baseUrl}/community/${communitySlug}/announcements`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          },
        ];
      } catch (error) {
        console.error(`Error creating URLs for community ${community._id}:`, error);
        return [];
      }
    }).flat();

    const allPages = [...staticPages, ...blogPages, ...expertPages];
    
    console.log(`Generated sitemap with ${allPages.length} URLs`);
    return allPages;
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback to basic sitemap if community fetching fails
    const basicPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/community`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ];

    // Still try to include blog posts
    try {
      const blogPosts = await getAllBlogPostsMetadata();
      const blogPages = blogPosts.map((post) => ({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: post.featured ? 0.8 : 0.6,
      }));
      
      return [...basicPages, ...blogPages];
    } catch (blogError) {
      console.error('Error fetching blog posts for sitemap:', blogError);
      return basicPages;
    }
  }
} 