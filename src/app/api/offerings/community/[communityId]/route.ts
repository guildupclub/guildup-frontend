import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const communityId = params.communityId;

    if (!communityId) {
      return NextResponse.json(
        { error: 'Community ID is required' },
        { status: 400 }
      );
    }

    // Fetch offerings for this community from backend
    const response = await fetch(`${BACKEND_URL}/v1/offering/community/${communityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching community offerings:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the offerings data
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('Error in community offerings API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community offerings' },
      { status: 500 }
    );
  }
} 