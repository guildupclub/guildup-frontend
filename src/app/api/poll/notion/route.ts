import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { fetchAllBlogPostsFromNotion } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Polling endpoint to fetch latest data from Notion and invalidate cache
 * This endpoint can be called periodically (e.g., every 5 minutes) to keep blog posts up to date
 * 
 * Usage:
 * - Call via cron job: GET https://dev.guildup.club/api/poll/notion
 * - Or use Vercel Cron (see vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.POLL_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid API key'
        },
        { status: 401 }
      );
    }
    
    console.log('Polling Notion database for updates...', {
      timestamp: new Date().toISOString()
    });
    
    // Fetch latest data from Notion to verify there are updates
    const posts = await fetchAllBlogPostsFromNotion();
    
    // Revalidate blog pages
    revalidatePath('/blogs');
    revalidatePath('/blogs/[slug]', 'page');
    revalidateTag('blogs');
    
    console.log('Cache invalidated successfully', {
      postsCount: posts.length,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Polling completed successfully',
      postsCount: posts.length,
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during polling:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to poll Notion database',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

