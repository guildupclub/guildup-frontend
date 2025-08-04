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
      // Convert category name to category ID by fetching categories first
      try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/v1/category`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const categoryName = category.replace(/-/g, ' '); // Convert URL format back to name
          const categoryObj = categoriesData.data.find(
            (cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          if (categoryObj) {
            requestBody.categoryId = categoryObj._id;
            console.log('Search API - Adding category filter:', categoryName, '->', categoryObj._id);
          } else {
            console.log('Search API - Category not found:', categoryName);
          }
        }
      } catch (error) {
        console.error('Search API - Error fetching categories:', error);
      }
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