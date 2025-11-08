import { NextRequest, NextResponse } from 'next/server';
import { fetchBlogPostBySlugFromNotion } from '@/lib/notion';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug is required'
        },
        { status: 400 }
      );
    }
    
    const post = await fetchBlogPostBySlugFromNotion(slug);
    
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: post
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

