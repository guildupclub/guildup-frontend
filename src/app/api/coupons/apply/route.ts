import { NextRequest, NextResponse } from 'next/server';

const OFFERINGS_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, cartTotal, offeringId } = body;

    if (!code || !userId || !cartTotal || !offeringId) {
      return NextResponse.json(
        { error: 'Missing required parameters: code, userId, cartTotal, offeringId' },
        { status: 400 }
      );
    }

    // Call the offerings service to apply coupon
    const response = await fetch(
      `${OFFERINGS_SERVICE_URL}/coupon/preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          userId,
          cartTotal,
          offeringId
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error applying coupon:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the coupon validation result
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in coupon API:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
} 