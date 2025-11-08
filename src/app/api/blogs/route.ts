import { NextRequest, NextResponse } from 'next/server';
import { fetchAllBlogPostsFromNotion } from '@/lib/notion';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    const posts = await fetchAllBlogPostsFromNotion();
    
    // Filter by category if provided
    let filteredPosts = posts;
    if (category && category !== 'All') {
      filteredPosts = posts.filter(post => post.category === category);
    }
    
    // Filter by featured if provided
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured);
    }
    
    // Remove content from metadata
    const metadata = filteredPosts.map(({ content, ...rest }) => rest);
    
    return NextResponse.json({
      success: true,
      data: metadata,
      count: metadata.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

