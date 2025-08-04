import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { offeringId: string } }
) {
  try {
    const offeringId = params.offeringId;

    if (!offeringId) {
      return NextResponse.json(
        { error: 'Offering ID is required' },
        { status: 400 }
      );
    }

    // Fetch offering details from backend
    const response = await fetch(`${BACKEND_URL}/v1/offerings/${offeringId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching offering:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the offering data
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('Error in offerings API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offering details' },
      { status: 500 }
    );
  }
} 