// app/api/proxy/route.ts
import { NextResponse } from 'next/server';

const TIMEOUT = 30000; // 10 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${query}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'YourApp/1.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
  
    const errorMessage =
      error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out'
        : 'Failed to fetch data';
  
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
}