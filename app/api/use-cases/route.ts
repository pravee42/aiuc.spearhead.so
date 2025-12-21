import { NextRequest, NextResponse } from 'next/server';

// Static 10-digit authentication token
const AUTH_TOKEN = '1234567890';

interface UseCaseData {
  'Capability': number;
  'Business Function': string;
  'Business Capability': string;
  'Stakeholder or User': string;
  'AI Use Case': string;
  'AI Algorithms & Frameworks': string;
  'Datasets': string;
  'Action / Implementation': string;
  'AI Tools & Models': string;
  'Digital Platforms and Tools': string;
  'Expected Outcomes and Results': string;
}

interface ApiResponse {
  total: number;
  page: number;
  page_size: number;
  data: UseCaseData[];
}

export async function GET(request: NextRequest) {
  try {
    // Check for authentication token in header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (token !== AUTH_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';

    // Call external API
    const apiUrl = `https://data-analytics-llm.onrender.com/use-cases?page=${page}&page_size=${pageSize}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

