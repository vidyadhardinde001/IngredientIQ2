import { NextResponse } from 'next/server';
import { connectDB, ProfileModel } from '@/lib/db';
import type { NextRequest } from 'next/server';

interface ApiResponse {
  success: boolean;
  profile?: any;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    
    const profileData = await request.json();
    
    // Validate required fields
    if (!profileData.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Additional validation can be added here
    if (!profileData.name || !profileData.age || !profileData.gender) {
      return NextResponse.json(
        { success: false, error: 'Name, age, and gender are required' },
        { status: 400 }
      );
    }

    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { email: profileData.email },
      profileData,
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true // Ensures schema validation runs on update
      }
    ).lean();

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error('Error saving profile:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' // Generic message for production
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const profile = await ProfileModel.findOne({ email }).lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    });

  } catch (error: any) {
    console.error('Error loading profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Add this if you're using Next.js 13.2+ with route handlers
export const dynamic = 'force-dynamic';