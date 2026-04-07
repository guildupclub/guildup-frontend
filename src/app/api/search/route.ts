import { NextRequest, NextResponse } from 'next/server';

// Use the same constants as the rest of the app
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '0';

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Handle wildcard query for showing all communities
    const searchQuery = query.trim() === "*" ? "" : query.trim();

    // Use the backend search endpoint that actually works
    const backendUrl = `${API_BASE_URL}/v1/community/look`;
    
    const requestBody = {
      query: searchQuery,
      page: parseInt(page) || 0,
      limit: 20,
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      // The frontend is sending the category ID directly, so we can use it
      requestBody.categoryId = category;
      console.log('Search API - Adding category filter:', category);
      console.log('Search API - Full request body:', requestBody);
    }

    console.log('Search API - Request URL:', backendUrl);
    console.log('Search API - Request Body:', requestBody);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Search API - Response status:', response.status);
    console.log('Search API - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API - Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('Search API - Response data:', data);

    // The backend returns { r: "s", data: [...] } format
    // We need to maintain this format for compatibility
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
} 