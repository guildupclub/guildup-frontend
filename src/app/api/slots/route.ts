import { NextRequest, NextResponse } from 'next/server';

const OFFERINGS_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offering_id = searchParams.get('offering_id');
    const date = searchParams.get('date');

    if (!offering_id || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: offering_id and date' },
        { status: 400 }
      );
    }

    // Call the offerings service to get available slots
    const response = await fetch(
      `${OFFERINGS_SERVICE_URL}/calendar/booking/available-slots?offering_id=${offering_id}&date=${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching slots:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // The backend returns slots directly as an array, not wrapped in a response object
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    } else {
      // Handle error responses
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error in slots API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
} 